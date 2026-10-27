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
import { SocketManager } from "@/lib/socket/socketManager";
import { registerMedia } from "../handlers/registerMedia";
import { MediaRuntime } from "../MediaRuntime";

type Ack = { ok: boolean; code?: string; [key: string]: unknown };

// Real socket.io clients and a real media worker, with the real media
// handlers. Only the auth middleware and the space permission are stubbed.
describe("media signalling with several clients", () => {
    let httpServer: ReturnType<typeof createServer>;
    let io: Server;
    let port: number;
    let media: MediaServer;
    let clients: ClientSocket[] = [];

    const request = (client: ClientSocket, event: string, payload?: unknown) =>
        new Promise<Ack>((resolve) => {
            if (payload === undefined) client.emit(event, resolve);
            else client.emit(event, payload, resolve);
        });

    const connect = async (userId: string, spaceId: string | null) => {
        const client = connectClient(`http://localhost:${port}`, {
            auth: { userId },
            forceNew: true,
            transports: ["websocket"],
        });
        clients.push(client);
        await new Promise<void>((r) => client.once("connect", () => r()));
        if (!spaceId) return client;

        client.emit("space:join", { spaceId });
        await new Promise<void>((r) => client.once("space:joined", () => r()));
        return client;
    };

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
            { listenIp: "127.0.0.1", listenPort: 44666, logLevel: "error" },
            {
                consumerNew: () => undefined,
                consumerClosed: () => undefined,
                producerDemand: () => undefined,
            }
        );
        MediaRuntime.useServer(media);
    });

    afterAll(async () => {
        clients.forEach((client) => client.close());
        MediaRuntime.useServer(null);
        media.close();
        await io.close();
    });

    it("refuses media before joining a space", async () => {
        const client = await connect("loner", null);
        const answer = await request(client, "media:get-capabilities");
        expect(answer).toEqual({ ok: false, code: "MEDIA_NOT_JOINED" });
    });

    it("negotiates the capabilities and both transports", async () => {
        const client = await connect("a", "s1");
        const caps = await request(client, "media:get-capabilities");
        expect(caps.ok).toBe(true);
        expect(caps.rtpCapabilities).toBeDefined();

        const send = await request(client, "media:create-transport", {
            direction: "send",
        });
        expect(send.ok).toBe(true);
        expect(typeof send.transportId).toBe("string");

        const recv = await request(client, "media:create-transport", {
            direction: "recv",
            rtpCapabilities: caps.rtpCapabilities,
        });
        expect(recv.ok).toBe(true);
        expect(media.getRoom("s1")?.counts().transports).toBe(2);

        const again = await request(client, "media:create-transport", {
            direction: "send",
        });
        expect(again).toEqual({ ok: false, code: "MEDIA_TRANSPORT_EXISTS" });
    });

    it("rejects malformed requests and a producer on a transport that is not its own", async () => {
        const client = await connect("b", "s1");
        await request(client, "media:get-capabilities");

        const bad = await request(client, "media:create-transport", {
            direction: "recv",
        });
        expect(bad).toEqual({ ok: false, code: "MEDIA_INVALID_REQUEST" });

        const other = await connect("c", "s1");
        await request(other, "media:get-capabilities");
        const theirs = await request(other, "media:create-transport", {
            direction: "send",
        });

        const stolen = await request(client, "media:produce", {
            transportId: theirs.transportId,
            source: "mic",
            rtpParameters: {},
        });
        expect(stolen.ok).toBe(false);
        expect(media.getRoom("s1")?.counts().producers).toBe(0);
    });

    it("leaves no transport behind when a person disconnects", async () => {
        const client = await connect("d", "s2");
        await request(client, "media:get-capabilities");
        await request(client, "media:create-transport", { direction: "send" });
        expect(media.getRoom("s2")?.counts().transports).toBe(1);

        client.close();
        await vi.waitFor(() => expect(media.getRoom("s2")).toBeUndefined());
    });

    it("cleans up when the person moves to another space", async () => {
        const client = await connect("e", "s3");
        await request(client, "media:get-capabilities");
        await request(client, "media:create-transport", { direction: "send" });

        client.emit("space:join", { spaceId: "s4" });
        await vi.waitFor(() => expect(media.getRoom("s3")).toBeUndefined());
    });

    it("drops the whole media session on restart so it can be built again", async () => {
        const client = await connect("f", "s5");
        await request(client, "media:get-capabilities");
        await request(client, "media:create-transport", { direction: "send" });

        expect(await request(client, "media:restart")).toEqual({ ok: true });
        await vi.waitFor(() => expect(media.getRoom("s5")).toBeUndefined());

        await request(client, "media:get-capabilities");
        const again = await request(client, "media:create-transport", {
            direction: "send",
        });
        expect(again.ok).toBe(true);
    });
});
