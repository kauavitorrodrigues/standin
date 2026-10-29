import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server } from "socket.io";
import {
    io as connectClient,
    type Socket as ClientSocket,
} from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const { resolveJoinAccessMock } = vi.hoisted(() => ({
    resolveJoinAccessMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    SpaceGuestService: { listPending: async () => [] },
    AvatarService: { ensureSheetUpToDate: async () => null },
}));
vi.mock("@/lib/socket/services/resolveJoinAccess", () => ({
    resolveJoinAccess: resolveJoinAccessMock,
}));

import { MediaServer } from "@standin/media";
import { registerJoinSpace } from "@/lib/socket/handlers/joinSpace";
import { registerDisconnect } from "@/lib/socket/handlers/disconnect";
import { registerSpacePosition } from "@/lib/socket/handlers/spacePosition";
import { SocketManager } from "@/lib/socket/socketManager";
import { registerMedia } from "../handlers/registerMedia";
import { mediaNotifier } from "../mediaNotifier";
import { MediaRuntime } from "../MediaRuntime";
import { startMediaTicker } from "../startMediaTicker";

type Ack = { ok: boolean; [key: string]: unknown };

// The whole chain on the server, with real sockets and a real worker: two
// people join, one produces a microphone, both stand close, and the other one
// must be sent a consumer for it by the ticker and the planner.
describe("media flow from a producer to a receiver", () => {
    let httpServer: ReturnType<typeof createServer>;
    let io: Server;
    let port: number;
    let media: MediaServer;
    let stopTicker: () => void;
    const clients: ClientSocket[] = [];

    const request = (client: ClientSocket, event: string, payload?: unknown) =>
        new Promise<Ack>((resolve) => {
            if (payload === undefined) client.emit(event, resolve);
            else client.emit(event, payload, resolve);
        });

    const join = async (userId: string, spaceId = "flow") => {
        const client = connectClient(`http://localhost:${port}`, {
            auth: { userId },
            forceNew: true,
            transports: ["websocket"],
        });
        clients.push(client);
        await new Promise<void>((r) => client.once("connect", () => r()));
        client.emit("space:join", { spaceId });
        await new Promise<void>((r) => client.once("space:joined", () => r()));
        return client;
    };

    const stand = (client: ClientSocket, x: number) =>
        client.emit("space:position", {
            x,
            y: 100,
            direction: "down",
            isSitting: false,
        });

    beforeAll(async () => {
        httpServer = createServer();
        io = new Server(httpServer);
        io.use((socket, next) => {
            socket.data.userId = socket.handshake.auth.userId;
            socket.data.spaceId = null;
            next();
        });
        io.on("connection", (socket) => {
            registerJoinSpace(io, socket);
            registerSpacePosition(socket);
            registerMedia(socket);
            registerDisconnect(socket);
        });
        SocketManager.set(io as never);
        await new Promise<void>((r) => httpServer.listen(0, r));
        port = (httpServer.address() as AddressInfo).port;

        resolveJoinAccessMock.mockResolvedValue({
            isHost: true,
            isOwner: false,
        });
        media = await MediaServer.create(
            { listenIp: "127.0.0.1", listenPort: 44999, logLevel: "error" },
            mediaNotifier
        );
        MediaRuntime.useServer(media);
        stopTicker = startMediaTicker(50);
    });

    afterAll(async () => {
        stopTicker();
        clients.forEach((client) => client.close());
        MediaRuntime.useServer(null);
        media.close();
        await io.close();
    });

    it("announces the microphone of one person to the one standing next to them", async () => {
        const producer = await join("producer");
        const receiver = await join("receiver");
        const announced: { userId: string; source: string }[] = [];
        receiver.on("media:consumer-new", (payload) => announced.push(payload));

        // The receiver negotiates like the browser does and can now receive.
        const caps = await request(receiver, "media:get-capabilities");
        expect(caps.ok).toBe(true);
        const recv = await request(receiver, "media:create-transport", {
            direction: "recv",
            rtpCapabilities: caps.rtpCapabilities,
        });
        expect(recv.ok).toBe(true);

        // The producer sends audio through a plain transport, since a real
        // DTLS handshake needs a browser.
        await request(producer, "media:get-capabilities");
        const room = media.getRoom("flow")!;
        const peerId = room
            .peerIds()
            .find((id) => room.userIdOf(id) === "producer")!;
        const plain = () =>
            room.router.createPlainTransport({
                listenInfo: { protocol: "udp", ip: "127.0.0.1" },
                rtcpMux: true,
                comedia: true,
            });
        const [send, unused] = await Promise.all([plain(), plain()]);
        room.attachTransports(peerId, {
            send,
            recv: unused,
            rtpCapabilities: room.rtpCapabilities,
        });
        await room.produce(peerId, send.id, "mic", {
            codecs: [
                {
                    mimeType: "audio/opus",
                    payloadType: 111,
                    clockRate: 48000,
                    channels: 2,
                    parameters: {},
                },
            ],
            encodings: [{ ssrc: 4242 }],
        });

        // Both stand within earshot.
        stand(producer, 100);
        stand(receiver, 140);

        await vi.waitFor(() => expect(announced).toHaveLength(1), {
            timeout: 12_000,
        });
        expect(announced[0]).toMatchObject({
            userId: "producer",
            source: "mic",
        });
    }, 20_000);

    it("does not announce the microphone of a person who is muted", async () => {
        const producer = await join("muted-producer", "flow-muted");
        const receiver = await join("muted-receiver", "flow-muted");
        const announced: unknown[] = [];
        receiver.on("media:consumer-new", (payload) => announced.push(payload));

        const caps = await request(receiver, "media:get-capabilities");
        await request(receiver, "media:create-transport", {
            direction: "recv",
            rtpCapabilities: caps.rtpCapabilities,
        });

        await request(producer, "media:get-capabilities");
        const room = media.getRoom("flow-muted")!;
        const peerId = room
            .peerIds()
            .find((id) => room.userIdOf(id) === "muted-producer")!;
        const plain = () =>
            room.router.createPlainTransport({
                listenInfo: { protocol: "udp", ip: "127.0.0.1" },
                rtcpMux: true,
                comedia: true,
            });
        const [send, unused] = await Promise.all([plain(), plain()]);
        room.attachTransports(peerId, {
            send,
            recv: unused,
            rtpCapabilities: room.rtpCapabilities,
        });
        await room.produce(peerId, send.id, "mic", {
            codecs: [
                {
                    mimeType: "audio/opus",
                    payloadType: 111,
                    clockRate: 48000,
                    channels: 2,
                    parameters: {},
                },
            ],
            encodings: [{ ssrc: 5252 }],
        });

        // The person mutes before anyone comes near.
        producer.emit("media:set-muted", { muted: true });
        await new Promise((resolve) => setTimeout(resolve, 100));
        stand(producer, 100);
        stand(receiver, 140);

        await new Promise((resolve) => setTimeout(resolve, 600));
        expect(announced).toHaveLength(0);

        // Unmuting hands the voice over on the next tick.
        producer.emit("media:set-muted", { muted: false });
        await vi.waitFor(() => expect(announced).toHaveLength(1), {
            timeout: 4000,
        });
    });

    describe("hiding the video of a person", () => {
        type Announced = { consumerId: string; userId: string; source: string };

        const setUp = async (spaceId: string) => {
            const producer = await join("hide-producer", spaceId);
            const receiver = await join("hide-receiver", spaceId);
            const announced: Announced[] = [];
            const closed: { consumerId: string }[] = [];
            const released: { userIds: string[] }[] = [];
            receiver.on("media:consumer-new", (p) => announced.push(p));
            receiver.on("media:consumer-closed", (p) => closed.push(p));
            receiver.on("media:hidden-video-changed", (p) => released.push(p));

            const caps = await request(receiver, "media:get-capabilities");
            await request(receiver, "media:create-transport", {
                direction: "recv",
                rtpCapabilities: caps.rtpCapabilities,
            });

            await request(producer, "media:get-capabilities");
            const room = media.getRoom(spaceId)!;
            const peerId = room
                .peerIds()
                .find((id) => room.userIdOf(id) === "hide-producer")!;
            const plain = () =>
                room.router.createPlainTransport({
                    listenInfo: { protocol: "udp", ip: "127.0.0.1" },
                    rtcpMux: true,
                    comedia: true,
                });
            const [send, unused] = await Promise.all([plain(), plain()]);
            room.attachTransports(peerId, {
                send,
                recv: unused,
                rtpCapabilities: room.rtpCapabilities,
            });
            await room.produce(peerId, send.id, "mic", {
                codecs: [
                    {
                        mimeType: "audio/opus",
                        payloadType: 111,
                        clockRate: 48000,
                        channels: 2,
                        parameters: {},
                    },
                ],
                encodings: [{ ssrc: 6161 }],
            });
            await room.produce(peerId, send.id, "camera", {
                codecs: [
                    {
                        mimeType: "video/VP8",
                        payloadType: 96,
                        clockRate: 90000,
                        parameters: {},
                    },
                ],
                encodings: [{ ssrc: 6262 }],
            });

            stand(producer, 100);
            stand(receiver, 140);
            const countOf = (source: string) =>
                announced.filter((entry) => entry.source === source).length;
            await vi.waitFor(
                () => {
                    expect(countOf("mic")).toBe(1);
                    expect(countOf("camera")).toBe(1);
                },
                { timeout: 12_000 }
            );
            return { producer, receiver, announced, closed, released, countOf };
        };

        it("stops the camera of that person only, and keeps hearing them", async () => {
            const { receiver, announced, closed } = await setUp("flow-hide");
            const camera = announced.find((entry) => entry.source === "camera")!;

            receiver.emit("media:set-hidden-video", { userIds: ["hide-producer"] });

            await vi.waitFor(
                () => expect(closed.map((c) => c.consumerId)).toEqual([
                    camera.consumerId,
                ]),
                { timeout: 6000 }
            );
        }, 25_000);

        it("keeps it hidden while the person moves, and shows it again on request", async () => {
            const { producer, receiver, countOf, closed } =
                await setUp("flow-hide-replan");

            receiver.emit("media:set-hidden-video", { userIds: ["hide-producer"] });
            await vi.waitFor(() => expect(closed).toHaveLength(1), {
                timeout: 6000,
            });

            // The surroundings change again and again, and the camera does not
            // come back by itself.
            for (const x of [105, 110, 115, 120]) {
                stand(producer, x);
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            expect(countOf("camera")).toBe(1);
            expect(closed).toHaveLength(1);

            receiver.emit("media:set-hidden-video", { userIds: [] });
            await vi.waitFor(() => expect(countOf("camera")).toBe(2), {
                timeout: 6000,
            });
        }, 30_000);

        it("ends the hiding on its own when the person leaves the reach, and tells the client", async () => {
            const { producer, receiver, countOf, released } =
                await setUp("flow-hide-leave");

            receiver.emit("media:set-hidden-video", { userIds: ["hide-producer"] });
            await new Promise((resolve) => setTimeout(resolve, 600));

            stand(producer, 100 + 5000);
            await vi.waitFor(
                () => expect(released).toEqual([{ userIds: [] }]),
                { timeout: 8000 }
            );

            // Back in the reach, the camera shows without asking again.
            stand(producer, 100);
            await vi.waitFor(() => expect(countOf("camera")).toBe(2), {
                timeout: 8000,
            });
        }, 30_000);
    });
});
