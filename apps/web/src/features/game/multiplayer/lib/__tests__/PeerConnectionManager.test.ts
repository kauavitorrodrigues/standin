import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PEER_MESSAGE_TYPES } from "@standin/contracts";
import {
    PeerConnectionManager,
    type PeerConnectionEvents,
    type PeerLinkHandle,
} from "../PeerConnectionManager";
import type { PeerLinkOptions } from "../PeerLink";
import { MEDIA_SLOTS, type MediaSlot } from "../../types/transport";
import { PEER_CONNECT_TIMEOUT_MS } from "../../consts/sync";
import { fakeTrack } from "./fakeRtc";

class FakeLink implements PeerLinkHandle {
    isOpen = false;
    readonly sent: string[] = [];
    readonly tracks: Record<MediaSlot, MediaStreamTrack | null> = {
        audio: null,
        camera: null,
        screen: null,
    };
    readonly signals: unknown[] = [];
    readonly encodings: Record<string, unknown> = {};
    closed = false;

    readonly options: PeerLinkOptions;

    constructor(options: PeerLinkOptions) {
        this.options = options;
    }

    getStreamId = (slot: MediaSlot) => `${slot}-stream`;
    signal = (signal: unknown) => void this.signals.push(signal);
    send = (data: string) => {
        this.sent.push(data);
        return true;
    };
    setTrack = (slot: MediaSlot, track: MediaStreamTrack | null) => {
        this.tracks[slot] = track;
    };
    setEncoding = (slot: MediaSlot, encoding: unknown) => {
        this.encodings[slot] = encoding;
    };
    close = () => {
        if (this.closed) return;
        this.closed = true;
        this.options.events.onClose();
    };

    open() {
        this.isOpen = true;
        this.options.events.onOpen();
    }

    mediaStates() {
        return this.sent
            .map((raw) => JSON.parse(raw))
            .filter((message) => message.type === PEER_MESSAGE_TYPES.MEDIA_STATE)
            .map((message) => message.payload);
    }
}

const createEvents = (): PeerConnectionEvents => ({
    onSignal: vi.fn(),
    onPeerConnected: vi.fn(),
    onPeerData: vi.fn(),
    onRemoteTrack: vi.fn(),
    onPeerClosed: vi.fn(),
});

const setup = () => {
    const links = new Map<string, FakeLink>();
    let lastTarget = "";
    const events = createEvents();
    const manager = new PeerConnectionManager(events, (options) => {
        const link = new FakeLink(options);
        links.set(lastTarget, link);
        return link;
    });
    manager.setLocalIdentity({ socketId: "m", userId: "user-me" });

    const connect = (socketId: string, initiator = true) => {
        lastTarget = socketId;
        manager.createConnection(socketId, initiator);
        return links.get(socketId)!;
    };

    return { manager, events, links, connect };
};

describe("PeerConnectionManager connections", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("createConnection reuses an existing link", () => {
        const { manager, links, connect } = setup();
        connect("a");
        const before = links.get("a");
        manager.createConnection("a", true);

        expect(links.get("a")).toBe(before);
    });

    it("derives politeness from the two socket ids", () => {
        const { connect } = setup();

        expect(connect("a").options.polite).toBe(true);
        expect(connect("z").options.polite).toBe(false);
    });

    it("falls back to opposite politeness per side when our id is unknown", () => {
        const links: FakeLink[] = [];
        const manager = new PeerConnectionManager(createEvents(), (options) => {
            const link = new FakeLink(options);
            links.push(link);
            return link;
        });
        vi.spyOn(console, "warn").mockImplementation(() => {});

        manager.createConnection("a", true);
        manager.createConnection("b", false);

        // Never both impolite: that is the combination glare cannot resolve.
        expect(links[0].options.polite).toBe(false);
        expect(links[1].options.polite).toBe(true);
    });

    it("hands each link the current ICE servers on demand", () => {
        const { manager, connect } = setup();
        manager.setIceServers([{ urls: "turn:old" }]);
        const link = connect("a");

        manager.setIceServers([{ urls: "turn:new" }]);

        expect(link.options.iceServers).toEqual([{ urls: "turn:old" }]);
        expect(link.options.getIceServers?.()).toEqual([{ urls: "turn:new" }]);
    });

    it("ignores non-offer signals for an unknown peer", () => {
        const { manager, links } = setup();
        manager.handleSignal("ghost", { candidate: { candidate: "x" } });
        manager.handleSignal("ghost", {
            description: { type: "answer", sdp: "x" },
        });

        expect(links.size).toBe(0);
    });

    it("an offer from an unknown peer creates a non-initiator link", () => {
        const { manager, links } = setup();
        manager.handleSignal("early", {
            description: { type: "offer", sdp: "x" },
        });

        expect(links.get("")?.options.initiator).toBe(false);
        expect(links.get("")?.signals).toHaveLength(1);
    });

    it("destroys a peer that never connects within the timeout", () => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        const { events, connect } = setup();
        const link = connect("a");

        vi.advanceTimersByTime(PEER_CONNECT_TIMEOUT_MS);

        expect(link.closed).toBe(true);
        expect(events.onPeerClosed).toHaveBeenCalledWith("a");
    });

    it("does not time out once the channel opened", () => {
        const { events, connect } = setup();
        const link = connect("a");
        link.open();

        vi.advanceTimersByTime(PEER_CONNECT_TIMEOUT_MS * 2);

        expect(link.closed).toBe(false);
        expect(events.onPeerConnected).toHaveBeenCalledWith("a");
    });

    it("only sends app data to open links", () => {
        const { manager, connect } = setup();
        const open = connect("a");
        const closed = connect("b");
        open.open();
        open.sent.length = 0;

        manager.broadcastTyping({
            conversationId: "c",
            userId: "u",
            userName: "n",
            isTyping: true,
        });

        expect(open.sent).toHaveLength(1);
        expect(closed.sent).toHaveLength(0);
    });

    it("throttles position broadcasts", () => {
        const { manager, connect } = setup();
        const link = connect("a");
        link.open();
        link.sent.length = 0;
        const position = { x: 1, y: 2, direction: "down", isSitting: false };

        vi.setSystemTime(10_000);
        manager.broadcastPosition(position as never);
        manager.broadcastPosition(position as never);

        expect(link.sent).toHaveLength(1);
    });

    it("parses incoming data and drops malformed frames", () => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        const { events, connect } = setup();
        const link = connect("a");

        link.options.events.onData(JSON.stringify({ hello: "world" }));
        link.options.events.onData("not json");

        expect(events.onPeerData).toHaveBeenCalledTimes(1);
        expect(events.onPeerData).toHaveBeenCalledWith("a", { hello: "world" });
    });

    it("destroyAll closes every link", () => {
        const { manager, connect } = setup();
        const first = connect("a");
        const second = connect("b");

        manager.destroyAll();

        expect(first.closed).toBe(true);
        expect(second.closed).toBe(true);
    });
});

describe("PeerConnectionManager media gating", () => {
    const audio = fakeTrack("mic");
    const camera = fakeTrack("cam");
    const screen = fakeTrack("screen");

    it("a peer with no policy receives no media", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.AUDIO, audio);
        manager.setLocalTrack(MEDIA_SLOTS.CAMERA, camera);
        manager.setLocalTrack(MEDIA_SLOTS.SCREEN, screen);

        const link = connect("a");

        expect(link.tracks).toEqual({ audio: null, camera: null, screen: null });
    });

    it("gives each peer only what its own policy allows", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.AUDIO, audio);
        manager.setLocalTrack(MEDIA_SLOTS.CAMERA, camera);
        const near = connect("near");
        const hearing = connect("hearing");
        const far = connect("far");

        manager.setMediaPolicies(
            new Map([
                ["near", { audio: true, video: true }],
                ["hearing", { audio: true, video: false }],
            ])
        );

        expect(near.tracks).toMatchObject({ audio, camera });
        expect(hearing.tracks).toMatchObject({ audio, camera: null });
        expect(far.tracks).toEqual({ audio: null, camera: null, screen: null });
    });

    it("detaches everything when a peer leaves the range", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.AUDIO, audio);
        manager.setLocalTrack(MEDIA_SLOTS.SCREEN, screen);
        const link = connect("a");
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));
        expect(link.tracks.screen).toBe(screen);

        manager.setMediaPolicies(new Map());

        expect(link.tracks).toEqual({ audio: null, camera: null, screen: null });
    });

    it("a new local track reaches peers that are already allowed", () => {
        const { manager, connect } = setup();
        const link = connect("a");
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));

        manager.setLocalTrack(MEDIA_SLOTS.SCREEN, screen);
        expect(link.tracks.screen).toBe(screen);

        manager.setLocalTrack(MEDIA_SLOTS.SCREEN, null);
        expect(link.tracks.screen).toBeNull();
    });

    it("a peer created after the policy is set gets media immediately", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.AUDIO, audio);
        manager.setMediaPolicies(new Map([["late", { audio: true, video: false }]]));

        expect(connect("late").tracks.audio).toBe(audio);
    });

    it("reports which peers currently receive video", () => {
        const { manager, connect } = setup();
        connect("a");
        connect("b");
        manager.setMediaPolicies(
            new Map([
                ["a", { audio: true, video: true }],
                ["b", { audio: true, video: false }],
            ])
        );

        expect([...manager.getReceivingVideoPeers()]).toEqual(["a"]);
    });

    it("shrinks the video bitrate as more peers receive it", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.CAMERA, camera);
        const first = connect("a");
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));
        const alone = (first.encodings.camera as { maxBitrate: number })
            .maxBitrate;

        connect("b");
        connect("c");
        manager.setMediaPolicies(
            new Map([
                ["a", { audio: true, video: true }],
                ["b", { audio: true, video: true }],
                ["c", { audio: true, video: true }],
            ])
        );
        const shared = (first.encodings.camera as { maxBitrate: number })
            .maxBitrate;

        expect(shared).toBeLessThan(alone);
    });
});

describe("PeerConnectionManager media state announcements", () => {
    const camera = fakeTrack("cam");
    const screen = fakeTrack("screen");

    it("announces nothing until the channel is open", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.CAMERA, camera);
        const link = connect("a");
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));

        expect(link.mediaStates()).toHaveLength(0);
    });

    it("announces the current state as soon as the channel opens", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.CAMERA, camera);
        const link = connect("a");
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));

        link.open();

        expect(link.mediaStates()).toEqual([
            {
                userId: "user-me",
                cameraStreamId: "camera-stream",
                screenStreamId: null,
            },
        ]);
    });

    it("announces a screen share starting and stopping, once each", () => {
        const { manager, connect } = setup();
        const link = connect("a");
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));
        link.open();
        link.sent.length = 0;

        manager.setLocalTrack(MEDIA_SLOTS.SCREEN, screen);
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));
        manager.setLocalTrack(MEDIA_SLOTS.SCREEN, null);

        expect(link.mediaStates().map((state) => state.screenStreamId)).toEqual(
            ["screen-stream", null]
        );
    });

    it("does not resend an unchanged state on every policy tick", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.CAMERA, camera);
        const link = connect("a");
        link.open();
        link.sent.length = 0;

        for (let tick = 0; tick < 5; tick++) {
            manager.setMediaPolicies(
                new Map([["a", { audio: true, video: true }]])
            );
        }

        expect(link.mediaStates()).toHaveLength(1);
    });

    it("tells a peer nothing is being sent once it leaves the range", () => {
        const { manager, connect } = setup();
        manager.setLocalTrack(MEDIA_SLOTS.CAMERA, camera);
        const link = connect("a");
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));
        link.open();
        link.sent.length = 0;

        manager.setMediaPolicies(new Map());

        expect(link.mediaStates()).toEqual([
            { userId: "user-me", cameraStreamId: null, screenStreamId: null },
        ]);
    });

    it("never claims a stream that has no local track behind it", () => {
        const { manager, connect } = setup();
        const link = connect("a");
        manager.setMediaPolicies(new Map([["a", { audio: true, video: true }]]));
        link.open();

        expect(link.mediaStates()[0]).toMatchObject({
            cameraStreamId: null,
            screenStreamId: null,
        });
    });
});
