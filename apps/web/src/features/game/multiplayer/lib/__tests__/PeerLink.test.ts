import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PeerLink, type PeerLinkDeps } from "../PeerLink";
import {
    ICE_DISCONNECTED_GRACE_MS,
    ICE_RESTART_BASE_DELAY_MS,
    ICE_RESTART_MAX_ATTEMPTS,
} from "../../consts/connection";
import { MEDIA_SLOTS, type PeerLinkEvents } from "../../types/transport";
import {
    FakeMediaStream,
    FakePeerConnection,
    fakeTrack,
    flush,
} from "./fakeRtc";

const createEvents = (): PeerLinkEvents => ({
    onSignal: vi.fn(),
    onOpen: vi.fn(),
    onData: vi.fn(),
    onTrack: vi.fn(),
    onClose: vi.fn(),
});

type Harness = {
    link: PeerLink;
    pc: FakePeerConnection;
    events: PeerLinkEvents;
};

const createLink = (initiator: boolean, polite: boolean): Harness => {
    const pc = new FakePeerConnection();
    const events = createEvents();
    const deps: PeerLinkDeps = {
        createPeerConnection: () => pc as unknown as RTCPeerConnection,
        createMediaStream: () =>
            new FakeMediaStream() as unknown as MediaStream,
    };
    const link = new PeerLink({
        initiator,
        polite,
        iceServers: [],
        events,
        deps,
    });
    return { link, pc, events };
};

// Delivers every signal one side emits to the other, the way the socket
// relay does, until both sides go quiet.
const connectPair = (a: Harness, b: Harness): void => {
    (a.events.onSignal as ReturnType<typeof vi.fn>).mockImplementation(
        (signal) => queueMicrotask(() => b.link.signal(signal))
    );
    (b.events.onSignal as ReturnType<typeof vi.fn>).mockImplementation(
        (signal) => queueMicrotask(() => a.link.signal(signal))
    );
};

describe("PeerLink negotiation", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("the initiator sends the first offer", async () => {
        const { events } = createLink(true, false);
        await flush();

        expect(events.onSignal).toHaveBeenCalledWith({
            description: expect.objectContaining({ type: "offer" }),
        });
    });

    it("the non-initiator does not offer before the first remote offer", async () => {
        const { events } = createLink(false, true);
        await flush();

        expect(events.onSignal).not.toHaveBeenCalled();
    });

    it("answers a remote offer and then replays its own pending negotiation", async () => {
        const { link, events } = createLink(false, true);
        await flush();

        link.signal({ description: { type: "offer", sdp: "remote" } });
        await flush();

        const types = (events.onSignal as ReturnType<typeof vi.fn>).mock.calls
            .map(([signal]) => signal.description?.type)
            .filter(Boolean);
        expect(types[0]).toBe("answer");
        expect(types).toContain("offer");
    });

    it("applies a candidate only after the description in front of it", async () => {
        const { link, pc } = createLink(false, true);
        await flush();

        link.signal({ description: { type: "offer", sdp: "remote" } });
        link.signal({ candidate: { candidate: "candidate:1" } });
        await flush();

        expect(pc.candidates).toHaveLength(1);
        expect(console.error).not.toHaveBeenCalled();
    });

    it("two peers adding media at the same time both settle in stable", async () => {
        const a = createLink(true, false);
        const b = createLink(false, true);
        connectPair(a, b);
        await flush(60);

        expect(a.pc.signalingState).toBe("stable");
        expect(b.pc.signalingState).toBe("stable");

        a.link.setTrack(MEDIA_SLOTS.AUDIO, fakeTrack("a-audio"));
        b.link.setTrack(MEDIA_SLOTS.AUDIO, fakeTrack("b-audio"));
        await flush(80);

        expect(a.pc.signalingState).toBe("stable");
        expect(b.pc.signalingState).toBe("stable");
        expect(console.error).not.toHaveBeenCalled();
        // Both sides' changes were eventually negotiated: each received at
        // least one more description after the initial handshake.
        expect(a.pc.remoteDescriptionsApplied.length).toBeGreaterThan(1);
        expect(b.pc.remoteDescriptionsApplied.length).toBeGreaterThan(1);
    });

    it("the impolite side ignores a colliding offer instead of answering", async () => {
        const impolite = createLink(true, false);
        await flush();
        expect(impolite.pc.signalingState).toBe("have-local-offer");

        const before = impolite.pc.remoteDescriptionsApplied.length;
        impolite.link.signal({ description: { type: "offer", sdp: "remote" } });
        await flush();

        expect(impolite.pc.remoteDescriptionsApplied.length).toBe(before);
        expect(impolite.pc.signalingState).toBe("have-local-offer");
    });

    it("the polite side rolls back its own offer and answers the remote one", async () => {
        const polite = createLink(true, true);
        await flush();
        expect(polite.pc.signalingState).toBe("have-local-offer");

        polite.link.signal({ description: { type: "offer", sdp: "remote" } });
        await flush();

        expect(polite.pc.remoteDescriptionsApplied).toHaveLength(1);
        expect(polite.pc.localDescription?.type).not.toBe(undefined);
        expect(polite.pc.signalingState).not.toBe("have-remote-offer");
    });
});

describe("PeerLink media slots", () => {
    beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("does not create a transceiver for an empty slot", () => {
        const { link, pc } = createLink(true, false);
        link.setTrack(MEDIA_SLOTS.CAMERA, null);

        expect(pc.senders).toHaveLength(0);
    });

    it("creates the transceiver once and then only swaps the track", () => {
        const { link, pc } = createLink(true, false);
        const track = fakeTrack("cam");

        link.setTrack(MEDIA_SLOTS.CAMERA, track);
        link.setTrack(MEDIA_SLOTS.CAMERA, null);
        link.setTrack(MEDIA_SLOTS.CAMERA, track);

        expect(pc.senders).toHaveLength(1);
        expect(pc.senders[0].replaceTrack).toHaveBeenNthCalledWith(1, null);
        expect(pc.senders[0].replaceTrack).toHaveBeenNthCalledWith(2, track);
    });

    it("setting the track a slot already carries is a no-op", () => {
        const { link, pc } = createLink(true, false);
        const track = fakeTrack("cam");

        link.setTrack(MEDIA_SLOTS.CAMERA, track);
        link.setTrack(MEDIA_SLOTS.CAMERA, track);

        expect(pc.senders).toHaveLength(1);
        expect(pc.senders[0].replaceTrack).not.toHaveBeenCalled();
    });

    it("keeps camera and screen on independent senders and stream ids", () => {
        const { link, pc } = createLink(true, false);

        link.setTrack(MEDIA_SLOTS.CAMERA, fakeTrack("cam"));
        link.setTrack(MEDIA_SLOTS.SCREEN, fakeTrack("screen"));
        link.setTrack(MEDIA_SLOTS.CAMERA, null);

        expect(pc.senders).toHaveLength(2);
        expect(pc.senders[0].track).toBeNull();
        expect(pc.senders[1].track).not.toBeNull();
        expect(link.getStreamId(MEDIA_SLOTS.CAMERA)).not.toBe(
            link.getStreamId(MEDIA_SLOTS.SCREEN)
        );
    });

    it("applies the encoding to a video sender", () => {
        const { link, pc } = createLink(true, false);
        link.setTrack(MEDIA_SLOTS.SCREEN, fakeTrack("screen"));
        link.setEncoding(MEDIA_SLOTS.SCREEN, {
            maxBitrate: 1000,
            maxFramerate: 5,
        });

        expect(pc.senders[0].parameters.encodings[0]).toMatchObject({
            maxBitrate: 1000,
            maxFramerate: 5,
        });
    });

    it("does not push identical encoding limits twice", () => {
        const { link, pc } = createLink(true, false);
        link.setTrack(MEDIA_SLOTS.SCREEN, fakeTrack("screen"));

        link.setEncoding(MEDIA_SLOTS.SCREEN, { maxBitrate: 1000 });
        link.setEncoding(MEDIA_SLOTS.SCREEN, { maxBitrate: 1000 });
        expect(pc.senders[0].setParameters).toHaveBeenCalledTimes(1);

        link.setEncoding(MEDIA_SLOTS.SCREEN, { maxBitrate: 500 });
        expect(pc.senders[0].setParameters).toHaveBeenCalledTimes(2);
    });

    it("never applies encoding parameters to the audio slot", () => {
        const { link, pc } = createLink(true, false);
        link.setTrack(MEDIA_SLOTS.AUDIO, fakeTrack("mic"));
        link.setEncoding(MEDIA_SLOTS.AUDIO, { maxBitrate: 1000 });

        expect(pc.senders[0].setParameters).not.toHaveBeenCalled();
    });
});

describe("PeerLink data channel", () => {
    it("reports open, delivers string messages and ignores binary ones", () => {
        const { pc, events } = createLink(true, false);
        const channel = pc.channels[0];

        channel.open();
        channel.onmessage?.({ data: "hello" });
        channel.onmessage?.({ data: new ArrayBuffer(1) });

        expect(events.onOpen).toHaveBeenCalledTimes(1);
        expect(events.onData).toHaveBeenCalledTimes(1);
        expect(events.onData).toHaveBeenCalledWith("hello");
    });

    it("send only works while the channel is open", () => {
        const { link, pc } = createLink(true, false);

        expect(link.send("early")).toBe(false);
        pc.channels[0].open();
        expect(link.send("ok")).toBe(true);
        expect(pc.channels[0].sent).toEqual(["ok"]);
    });

    it("close is idempotent and reports closed once", () => {
        const { link, events, pc } = createLink(true, false);

        link.close();
        link.close();

        expect(events.onClose).toHaveBeenCalledTimes(1);
        expect(pc.closed).toBe(true);
        expect(link.send("late")).toBe(false);
    });
});

describe("PeerLink ICE recovery", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("restarts ICE after the disconnected grace period", () => {
        const { pc } = createLink(true, false);

        pc.setIceState("disconnected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS - 1);
        expect(pc.restartIce).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(pc.restartIce).toHaveBeenCalledTimes(1);
    });

    it("restarts with the current ICE servers, not the ones it was created with", () => {
        const pc = new FakePeerConnection();
        let servers: RTCIceServer[] = [{ urls: "turn:old" }];
        new PeerLink({
            initiator: true,
            polite: false,
            iceServers: servers,
            getIceServers: () => servers,
            events: createEvents(),
            deps: {
                createPeerConnection: () => pc as unknown as RTCPeerConnection,
                createMediaStream: () =>
                    new FakeMediaStream() as unknown as MediaStream,
            },
        });

        servers = [{ urls: "turn:new" }];
        pc.setIceState("disconnected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS);

        expect(pc.setConfiguration).toHaveBeenCalledWith({
            iceServers: [{ urls: "turn:new" }],
        });
        // The configuration is applied before the restart, or the restart
        // would still gather with the expired credentials.
        expect(pc.setConfiguration.mock.invocationCallOrder[0]).toBeLessThan(
            pc.restartIce.mock.invocationCallOrder[0]
        );
    });

    it("a restart that lands mid-negotiation waits for stable instead of colliding", async () => {
        const initiator = createLink(true, false);
        const other = createLink(false, true);
        await flush();
        // The initiator's first offer is out and still unanswered.
        expect(initiator.pc.signalingState).toBe("have-local-offer");
        const signals = vi.mocked(initiator.events.onSignal);
        const firstOffer = signals.mock.calls[0][0];
        const signalsBefore = signals.mock.calls.length;

        initiator.pc.setIceState("disconnected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS);
        await flush();

        // It asked for a restart, but must not stack a second offer on top
        // of the one still waiting for its answer.
        expect(initiator.pc.restartIce).toHaveBeenCalledTimes(1);
        expect(signals.mock.calls.length).toBe(signalsBefore);

        // Once the answer lands and the pair settles, the pending restart
        // goes out as a fresh offer.
        connectPair(initiator, other);
        other.link.signal(firstOffer);
        await flush(80);

        expect(initiator.pc.signalingState).toBe("stable");
        expect(signals.mock.calls.length).toBeGreaterThan(signalsBefore);
    });

    it("does not restart when the connection heals inside the grace period", () => {
        const { pc } = createLink(true, false);

        pc.setIceState("disconnected");
        pc.setIceState("connected");
        vi.advanceTimersByTime(ICE_DISCONNECTED_GRACE_MS * 2);

        expect(pc.restartIce).not.toHaveBeenCalled();
    });

    it("backs off exponentially between failed restarts", () => {
        const { pc } = createLink(true, false);

        pc.setIceState("failed");
        vi.advanceTimersByTime(ICE_RESTART_BASE_DELAY_MS);
        expect(pc.restartIce).toHaveBeenCalledTimes(1);

        pc.setIceState("failed");
        vi.advanceTimersByTime(ICE_RESTART_BASE_DELAY_MS * 2 - 1);
        expect(pc.restartIce).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(1);
        expect(pc.restartIce).toHaveBeenCalledTimes(2);
    });

    it("gives up and reports closed after the attempt cap", () => {
        const { pc, events } = createLink(true, false);

        for (let attempt = 0; attempt < ICE_RESTART_MAX_ATTEMPTS; attempt++) {
            pc.setIceState("failed");
            vi.advanceTimersByTime(
                ICE_RESTART_BASE_DELAY_MS * 2 ** attempt
            );
        }
        expect(pc.restartIce).toHaveBeenCalledTimes(ICE_RESTART_MAX_ATTEMPTS);
        expect(events.onClose).not.toHaveBeenCalled();

        pc.setIceState("failed");
        expect(events.onClose).toHaveBeenCalledTimes(1);
    });

    it("a successful reconnect resets the attempt counter", () => {
        const { pc, events } = createLink(true, false);

        for (let attempt = 0; attempt < ICE_RESTART_MAX_ATTEMPTS; attempt++) {
            pc.setIceState("failed");
            vi.advanceTimersByTime(
                ICE_RESTART_BASE_DELAY_MS * 2 ** attempt
            );
        }
        pc.setIceState("connected");
        pc.setIceState("failed");

        expect(events.onClose).not.toHaveBeenCalled();
    });
});

describe("PeerLink initial video limits", () => {
    it("creates a video transceiver already carrying the encoding limits", () => {
        const { link, pc } = createLink(true, false);
        const limits = {
            maxBitrate: 1_000_000,
            maxFramerate: 30,
            scaleResolutionDownBy: 1,
        };

        link.setEncoding(MEDIA_SLOTS.SCREEN, limits);
        link.setTrack(MEDIA_SLOTS.SCREEN, fakeTrack("screen-video"));

        expect(pc.transceiverInits[0]?.sendEncodings).toEqual([limits]);
    });

    it("sends no encodings for audio", () => {
        const { link, pc } = createLink(true, false);

        link.setEncoding(MEDIA_SLOTS.AUDIO, {
            maxBitrate: 1,
            maxFramerate: 1,
            scaleResolutionDownBy: 1,
        });
        link.setTrack(MEDIA_SLOTS.AUDIO, fakeTrack("mic-audio"));

        expect(pc.transceiverInits[0]?.sendEncodings).toBeUndefined();
    });
});
