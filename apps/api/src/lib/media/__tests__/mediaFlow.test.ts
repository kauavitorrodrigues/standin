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
});
