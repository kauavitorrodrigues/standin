import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server } from "socket.io";
import {
    io as connectClient,
    type Socket as ClientSocket,
} from "socket.io-client";
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const { resolveJoinAccessMock, resolveSheetMock } = vi.hoisted(() => ({
    resolveJoinAccessMock: vi.fn(),
    resolveSheetMock: vi.fn(),
}));

vi.mock("../../services/resolveJoinAccess", () => ({
    resolveJoinAccess: resolveJoinAccessMock,
}));
vi.mock("../../services/resolveAvatarSheetFileId", () => ({
    resolveAvatarSheetFileId: resolveSheetMock,
}));

import { registerJoinSpace } from "../joinSpace";
import { registerDisconnect } from "../disconnect";
import { registerSpacePosition } from "../spacePosition";
import { registerSpaceAnnouncing } from "../spaceAnnouncing";
import { SocketManager } from "../../socketManager";
import { RoomStates } from "../../utils/roomStates";
import { PresenceStore } from "../../presence/PresenceStore";
import { SpaceInterests } from "../../realtime/SpaceInterests";
import { AnnouncerSync } from "../../realtime/AnnouncerSync";
import { buildUserRoom } from "../../utils/buildUserRoom";

type Announcers = { announcers: { userId: string; announcingSince: number }[] };

// Real socket.io server and clients over a local port, with the real join,
// position, announcing and disconnect handlers. Only the auth middleware, the
// permission check and the lookup of the sheet are stubbed.
describe("announcing with several clients in a space", () => {
    let httpServer: ReturnType<typeof createServer>;
    let io: Server;
    let port: number;
    let clients: ClientSocket[] = [];

    const connect = async (userId: string, spaceId: string, x: number) => {
        const socket = connectClient(`http://localhost:${port}`, {
            auth: { userId },
            forceNew: true,
            transports: ["websocket"],
        });
        const lists: Announcers[] = [];
        socket.on("space:announcers", (payload: Announcers) =>
            lists.push(payload)
        );
        clients.push(socket);
        await new Promise<void>((resolve) =>
            socket.once("connect", () => resolve())
        );
        const joined = new Promise<void>((resolve) =>
            socket.once("space:joined", () => resolve())
        );
        socket.emit("space:join", { spaceId });
        await joined;
        move(socket, x);
        return { socket, lists };
    };

    const move = (socket: ClientSocket, x: number) =>
        socket.emit("space:position", {
            x,
            y: 0,
            direction: "down",
            isSitting: false,
        });

    const announce = (socket: ClientSocket, announcing: boolean) =>
        new Promise<{ ok: boolean; announcingSince?: number | null }>(
            (resolve) =>
                socket.emit("space:set-announcing", { announcing }, resolve)
        );

    beforeAll(async () => {
        httpServer = createServer();
        io = new Server(httpServer);
        SocketManager.set(io);
        io.use((socket, next) => {
            socket.data.userId = socket.handshake.auth.userId;
            socket.data.spaceId = null;
            next();
        });
        io.on("connection", (socket) => {
            socket.join(buildUserRoom(socket.data.userId));
            registerJoinSpace(io, socket);
            registerSpacePosition(socket);
            registerSpaceAnnouncing(io, socket);
            registerDisconnect(socket);
        });
        await new Promise<void>((resolve) => httpServer.listen(0, resolve));
        port = (httpServer.address() as AddressInfo).port;
    });

    afterAll(async () => {
        await io.close();
    });

    beforeEach(() => {
        RoomStates.clear();
        PresenceStore.clear();
        SpaceInterests.clear();
        AnnouncerSync.clear();
        resolveJoinAccessMock.mockResolvedValue({
            isHost: true,
            isOwner: false,
        });
        resolveSheetMock.mockResolvedValue(null);
    });

    const cleanup = () => {
        clients.forEach((socket) => socket.close());
        clients = [];
    };

    it("reaches only the client within earshot", async () => {
        const ana = await connect("ana", "m1", 0);
        const near = await connect("bruno", "m1", 100);
        const far = await connect("carla", "m1", 3000);
        await vi.waitFor(() =>
            expect(
                SpaceInterests.get("m1", far.socket.id as string)
            ).toBeDefined()
        );

        const answer = await announce(ana.socket, true);

        expect(answer.ok).toBe(true);
        await vi.waitFor(() => expect(near.lists).toHaveLength(1));
        expect(near.lists[0]?.announcers.map((a) => a.userId)).toEqual(["ana"]);
        expect(far.lists).toEqual([]);
        cleanup();
    });

    it("shows a late joiner in range the current announcers, oldest first", async () => {
        const ana = await connect("ana", "m2", 0);
        const bruno = await connect("bruno", "m2", 50);
        await announce(ana.socket, true);
        await new Promise((resolve) => setTimeout(resolve, 5));
        await announce(bruno.socket, true);

        const late = await connect("dora", "m2", 80);

        await vi.waitFor(() => expect(late.lists).toHaveLength(1));
        expect(late.lists[0]?.announcers.map((a) => a.userId)).toEqual([
            "ana",
            "bruno",
        ]);
        cleanup();
    });

    it("clears the state for the listeners when the announcer disconnects", async () => {
        const ana = await connect("ana", "m3", 0);
        const bruno = await connect("bruno", "m3", 100);
        await announce(ana.socket, true);
        await vi.waitFor(() => expect(bruno.lists).toHaveLength(1));

        ana.socket.close();

        await vi.waitFor(() => expect(bruno.lists).toHaveLength(2));
        expect(bruno.lists[1]?.announcers).toEqual([]);
        expect(PresenceStore.listAnnouncers("m3")).toEqual([]);
        cleanup();
    });
});
