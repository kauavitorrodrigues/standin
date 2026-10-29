import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { types } from "mediasoup";
import type {
    MediaConsumerNewPayload,
    MediaConsumerPausedPayload,
} from "@standin/contracts";
import { MediaServer } from "../MediaServer";
import type { SpaceMedia } from "../SpaceMedia";
import type { MediaNotifier } from "../types";

// A real worker, with the planner and the applier, to see what each receiver
// is told when a video is held back and when it plays again.

const opus = (ssrc: number): types.RtpParameters => ({
    codecs: [
        {
            mimeType: "audio/opus",
            payloadType: 111,
            clockRate: 48000,
            channels: 2,
            parameters: {},
        },
    ],
    encodings: [{ ssrc }],
});

const vp8 = (ssrc: number): types.RtpParameters => ({
    codecs: [
        {
            mimeType: "video/VP8",
            payloadType: 96,
            clockRate: 90000,
            parameters: {},
        },
    ],
    encodings: [{ ssrc }],
});

type Event = { peerId: string; payload: unknown };

describe("pause reasons with a real worker", () => {
    const created: Event[] = [];
    const paused: Event[] = [];
    const resumed: Event[] = [];
    const order: string[] = [];
    const notifier: MediaNotifier = {
        consumerNew: (peerId, payload) => {
            created.push({ peerId, payload });
            order.push(`new:${peerId}:${(payload as MediaConsumerNewPayload).source}`);
        },
        consumerClosed: () => undefined,
        producerDemand: () => undefined,
        consumerPaused: (peerId, payload) => {
            paused.push({ peerId, payload });
            order.push(`paused:${peerId}:${payload.reason}`);
        },
        consumerResumed: (peerId, payload) => {
            resumed.push({ peerId, payload });
            order.push(`resumed:${peerId}:${payload.reason}`);
        },
        hiddenVideoChanged: () => undefined,
    };
    const positions = new Map<string, { x: number; y: number }>();
    const source = { get: (id: string) => positions.get(id) };
    let server: MediaServer;
    let room: SpaceMedia;
    let clock = 10_000;
    // How many videos the shed of the server held back, kept for the next test.
    let shedHeld = 0;

    // A tick far enough from the last, so the debounce never holds it back.
    const tick = async (...ids: string[]) => {
        clock += 1000;
        await room.tick(clock, source, new Set(ids));
    };

    const join = async (peerId: string, ssrc: number, withCamera: boolean) => {
        room.addPeer(peerId, `user-${peerId}`);
        const plain = () =>
            room.router.createPlainTransport({
                listenInfo: { protocol: "udp", ip: "127.0.0.1" },
                rtcpMux: true,
                comedia: true,
            });
        const [send, recv] = await Promise.all([plain(), plain()]);
        room.attachTransports(peerId, {
            send,
            recv,
            rtpCapabilities: room.rtpCapabilities,
        });
        await room.produce(peerId, send.id, "mic", opus(ssrc));
        if (withCamera) {
            await room.produce(peerId, send.id, "camera", vp8(ssrc + 1));
        }
    };

    beforeAll(async () => {
        server = await MediaServer.create(
            { listenIp: "127.0.0.1", listenPort: 44557, logLevel: "error" },
            notifier
        );
        room = await server.acquireRoom("space-reasons");
        positions.set("me", { x: 0, y: 0 });
        positions.set("a", { x: 20, y: 0 });
        positions.set("b", { x: 40, y: 0 });
        await join("me", 100, false);
        await join("a", 200, true);
        await join("b", 300, true);
    });

    afterAll(() => server.close());

    beforeEach(() => {
        created.length = 0;
        paused.length = 0;
        resumed.length = 0;
        order.length = 0;
    });

    it("plays both videos of a normal receiver, and says nothing", async () => {
        await tick("me");

        expect(created.filter((e) => e.peerId === "me")).toHaveLength(4);
        expect(paused).toEqual([]);
        expect(room.consumerBreakdown().paused).toBe(0);
    });

    it("holds the second video back for a weak machine, saying why right after announcing it", async () => {
        room.removePeer("me");
        await join("me", 100, false);
        room.setLowQuality("me", true);
        created.length = 0;
        order.length = 0;

        await tick("me");

        expect(paused).toHaveLength(1);
        expect(paused[0]!.peerId).toBe("me");
        expect((paused[0]!.payload as MediaConsumerPausedPayload).reason).toBe(
            "client-limit"
        );
        // The notice comes after the announcement of that same consumer.
        const camera = order.filter((entry) => entry.startsWith("new:me:camera"));
        expect(camera).toHaveLength(2);
        expect(order.indexOf("paused:me:client-limit")).toBeGreaterThan(
            order.indexOf(camera[1]!)
        );
        // The voices were not touched.
        expect(order.filter((e) => e.startsWith("new:me:mic"))).toHaveLength(2);
    });

    it("says nothing again while nothing changes", async () => {
        paused.length = 0;
        await tick("me");
        expect(paused).toEqual([]);
    });

    it("plays it again, and says which reason ended, when the weak machine recovers", async () => {
        room.setLowQuality("me", false);
        await tick("me");

        expect(resumed).toHaveLength(1);
        expect((resumed[0]!.payload as MediaConsumerPausedPayload).reason).toBe(
            "client-limit"
        );
        expect(room.consumerBreakdown().paused).toBe(0);
    });

    it("holds back the least important videos when the server is short of CPU, never the voices", async () => {
        expect(room.setVideoShed(1)).toBe(true);
        await tick("me", "a", "b");

        const reasons = paused.map(
            (e) => (e.payload as MediaConsumerPausedPayload).reason
        );
        expect(reasons.length).toBeGreaterThan(0);
        expect(new Set(reasons)).toEqual(new Set(["server-limit"]));
        shedHeld = paused.length;
        const breakdown = room.consumerBreakdown();
        expect(breakdown.paused).toBe(shedHeld);
        // Every audio consumer still flows.
        expect(breakdown.audio).toBeGreaterThan(0);
        expect(order.some((entry) => entry.includes("mic") && entry.startsWith("paused"))).toBe(false);
    });

    it("gives the videos back, with the reason that ended, when the load goes down", async () => {
        expect(room.setVideoShed(0)).toBe(true);
        await tick("me", "a", "b");

        expect(resumed).toHaveLength(shedHeld);
        expect(
            resumed.every(
                (e) =>
                    (e.payload as MediaConsumerPausedPayload).reason ===
                    "server-limit"
            )
        ).toBe(true);
        expect(room.consumerBreakdown().paused).toBe(0);
    });

    it("says the level did not change when it is set to the same", () => {
        expect(room.setVideoShed(0)).toBe(false);
    });
});
