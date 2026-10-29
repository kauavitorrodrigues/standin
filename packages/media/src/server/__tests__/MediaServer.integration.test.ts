import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { types } from "mediasoup";
import type {
    MediaConsumerClosedPayload,
    MediaConsumerNewPayload,
    MediaConsumerPausedPayload,
    MediaHiddenVideoChangedPayload,
} from "@standin/contracts";
import { MediaServer } from "../MediaServer";
import type { SpaceMedia } from "../SpaceMedia";
import type { MediaNotifier } from "../types";

type Sent = {
    peerId: string;
    payload:
        | MediaConsumerNewPayload
        | MediaConsumerClosedPayload
        | MediaConsumerPausedPayload
        | MediaHiddenVideoChangedPayload;
};

const opusParameters = (ssrc: number): types.RtpParameters => ({
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

describe("MediaServer with a real worker", () => {
    const created: Sent[] = [];
    const closed: Sent[] = [];
    const paused: Sent[] = [];
    const resumed: Sent[] = [];
    const hiddenChanges: Sent[] = [];
    const notifier: MediaNotifier = {
        consumerNew: (peerId, payload) => created.push({ peerId, payload }),
        consumerClosed: (peerId, payload) => closed.push({ peerId, payload }),
        producerDemand: () => undefined,
        consumerPaused: (peerId, payload) => paused.push({ peerId, payload }),
        consumerResumed: (peerId, payload) =>
            resumed.push({ peerId, payload }),
        hiddenVideoChanged: (peerId, payload) =>
            hiddenChanges.push({ peerId, payload }),
    };
    const positions = new Map<string, { x: number; y: number }>();
    const source = { get: (id: string) => positions.get(id) };
    let server: MediaServer;
    let room: SpaceMedia;

    const joinPeer = async (peerId: string, ssrc: number) => {
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
        await room.produce(peerId, send.id, "mic", opusParameters(ssrc));
    };

    beforeAll(async () => {
        server = await MediaServer.create(
            { listenIp: "127.0.0.1", listenPort: 44555, logLevel: "error" },
            notifier
        );
        room = await server.acquireRoom("space-1");
        positions.set("a", { x: 0, y: 0 });
        positions.set("b", { x: 60, y: 0 });
        positions.set("c", { x: 1000, y: 0 });
        await joinPeer("a", 1111);
        await joinPeer("b", 2222);
        await joinPeer("c", 3333);
    });

    afterAll(() => server.close());

    it("starts, reports usage and stops", async () => {
        const usage = await server.usage();
        expect(usage.rooms).toBe(1);
        expect(usage.peers).toBe(3);
        expect(usage.producers).toBe(3);
    });

    it("creates consumers only for people in range", async () => {
        await room.tick(1000, source, new Set(["a", "b", "c"]));

        const heardByA = created.filter((sent) => sent.peerId === "a");
        expect(
            heardByA.map(
                (sent) => (sent.payload as MediaConsumerNewPayload).userId
            )
        ).toEqual(["user-b"]);
        expect(created.some((sent) => sent.peerId === "c")).toBe(false);
        expect(room.counts().consumers).toBe(2);
    });

    it("creates a consumer when a person walks in range and closes it beyond the exit radius", async () => {
        positions.set("c", { x: 100, y: 0 });
        await room.tick(2000, source, new Set(["a", "b", "c"]));
        expect(created.some((sent) => sent.peerId === "c")).toBe(true);
        expect(room.counts().consumers).toBe(6);

        // Inside the hysteresis band nothing is dropped.
        positions.set("c", { x: 140, y: 0 });
        await room.tick(3000, source, new Set(["a", "b", "c"]));
        expect(room.counts().consumers).toBe(6);

        // Within the debounce window a person out of reach is still cut.
        positions.set("c", { x: 1000, y: 0 });
        await room.tick(3050, source, new Set(["a", "b", "c"]));
        expect(closed.length).toBeGreaterThan(0);
        expect(room.counts().consumers).toBe(2);
    });

    it("closes the consumers of a person who leaves", async () => {
        const before = closed.length;
        room.removePeer("b");
        // The worker reports a closed producer on its own channel.
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(closed.length).toBeGreaterThan(before);
        expect(room.counts().consumers).toBe(0);
    });

    it("closes the room when the last person leaves", () => {
        room.removePeer("a");
        room.removePeer("c");
        server.releaseRoomIfEmpty("space-1");
        expect(server.getRoom("space-1")).toBeUndefined();
    });
});
