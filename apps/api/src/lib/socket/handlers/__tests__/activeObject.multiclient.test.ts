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

const { resolveJoinAccessMock, resolveSheetMock, isWebsiteMock } = vi.hoisted(
    () => ({
        resolveJoinAccessMock: vi.fn(),
        resolveSheetMock: vi.fn(),
        isWebsiteMock: vi.fn(),
    })
);

vi.mock("../../services/resolveJoinAccess", () => ({
    resolveJoinAccess: resolveJoinAccessMock,
}));
vi.mock("../../services/resolveAvatarSheetFileId", () => ({
    resolveAvatarSheetFileId: resolveSheetMock,
}));
vi.mock("../../services/isWebsiteObjectOfSpace", () => ({
    isWebsiteObjectOfSpace: isWebsiteMock,
}));

import { registerJoinSpace } from "../joinSpace";
import { registerDisconnect } from "../disconnect";
import { registerSpaceActiveObject } from "../spaceActiveObject";
import { registerSpaceCloseObjectForViewers } from "../spaceCloseObjectForViewers";
import { SocketManager } from "../../socketManager";
import { RoomStates } from "../../utils/roomStates";
import { PresenceStore } from "../../presence/PresenceStore";
import { SpaceInterests } from "../../realtime/SpaceInterests";
import { buildUserRoom } from "../../utils/buildUserRoom";

type ActiveObject = {
    socketId: string;
    userId: string;
    objectId: string | null;
};
type Joined = {
    activeObjects: { socketId: string; userId: string; objectId: string }[];
};

// Real socket.io server and clients over a local port, with the real join,
// active object, close and disconnect handlers. Only the auth middleware, the
// permission check, the lookup of the sheet and the check that the object is
// a website of the map are stubbed.
describe("the object each person has open, with several clients", () => {
    let httpServer: ReturnType<typeof createServer>;
    let io: Server;
    let port: number;
    let clients: ClientSocket[] = [];

    const connect = async (userId: string, spaceId: string) => {
        const socket = connectClient(`http://localhost:${port}`, {
            auth: { userId },
            forceNew: true,
            transports: ["websocket"],
        });
        const changes: ActiveObject[] = [];
        const closed: { objectId: string; closedByUserId: string }[] = [];
        socket.on("space:active-object", (payload: ActiveObject) =>
            changes.push(payload)
        );
        socket.on("space:object-closed", (payload) => closed.push(payload));
        clients.push(socket);
        await new Promise<void>((resolve) =>
            socket.once("connect", () => resolve())
        );
        const joined = new Promise<Joined>((resolve) =>
            socket.once("space:joined", resolve)
        );
        socket.emit("space:join", { spaceId });
        return { socket, changes, closed, joined: await joined };
    };

    const open = (socket: ClientSocket, objectId: string | null) =>
        new Promise<{ ok: boolean; code?: string }>((resolve) =>
            socket.emit("space:set-active-object", { objectId }, resolve)
        );

    const closeForViewers = (socket: ClientSocket, objectId: string) =>
        new Promise<{ ok: boolean; code?: string }>((resolve) =>
            socket.emit("space:close-object-for-viewers", { objectId }, resolve)
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
            registerSpaceActiveObject(socket);
            registerSpaceCloseObjectForViewers(io, socket);
            registerDisconnect(socket);
        });
        await new Promise<void>((resolve) => httpServer.listen(0, resolve));
        port = (httpServer.address() as AddressInfo).port;
    });

    afterAll(async () => {
        await io.close();
        await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    });

    beforeEach(() => {
        RoomStates.clear();
        PresenceStore.clear();
        SpaceInterests.clear();
        isWebsiteMock.mockReset();
        isWebsiteMock.mockResolvedValue(true);
        resolveJoinAccessMock.mockImplementation(async (userId: string) => ({
            isHost: !userId.startsWith("guest"),
            isOwner: false,
        }));
        resolveSheetMock.mockResolvedValue(null);
    });

    const cleanup = () => {
        clients.forEach((socket) => socket.close());
        clients = [];
    };

    it("tells the others what a person opened and closed", async () => {
        const ana = await connect("ana", "m1");
        const bruno = await connect("bruno", "m1");

        expect(await open(ana.socket, "object-1")).toEqual({
            ok: true,
            objectId: "object-1",
        });
        await vi.waitFor(() => expect(bruno.changes).toHaveLength(1));
        expect(bruno.changes[0]).toMatchObject({
            userId: "ana",
            objectId: "object-1",
        });

        await open(ana.socket, null);
        await vi.waitFor(() => expect(bruno.changes).toHaveLength(2));
        expect(bruno.changes[1]).toMatchObject({
            userId: "ana",
            objectId: null,
        });
        expect(ana.changes).toEqual([]);
        cleanup();
    });

    it("tells who joins later what the people inside have open", async () => {
        const ana = await connect("ana", "m2");
        await open(ana.socket, "object-1");

        const late = await connect("dora", "m2");

        expect(late.joined.activeObjects).toEqual([
            {
                socketId: ana.socket.id,
                userId: "ana",
                objectId: "object-1",
            },
        ]);
        cleanup();
    });

    it("refuses an object that is not a website of the space", async () => {
        isWebsiteMock.mockResolvedValue(false);
        const ana = await connect("ana", "m3");
        const bruno = await connect("bruno", "m3");

        expect(await open(ana.socket, "somewhere-else")).toEqual({
            ok: false,
            code: "ACTIVE_OBJECT_INVALID",
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(bruno.changes).toEqual([]);
        cleanup();
    });

    it("closes the object for everyone looking at it, and for no one else", async () => {
        const ana = await connect("ana", "m4");
        const bruno = await connect("bruno", "m4");
        const carla = await connect("carla", "m4");
        await open(ana.socket, "object-1");
        await open(bruno.socket, "object-1");
        await open(carla.socket, "object-2");

        expect(await closeForViewers(bruno.socket, "object-1")).toEqual({
            ok: true,
        });

        await vi.waitFor(() => expect(ana.closed).toHaveLength(1));
        expect(ana.closed[0]).toEqual({
            objectId: "object-1",
            closedByUserId: "bruno",
        });
        expect(bruno.closed).toHaveLength(1);

        const late = await connect("dora", "m4");
        expect(late.joined.activeObjects.map((a) => a.userId)).toEqual([
            "carla",
        ]);
        cleanup();
    });

    it("does not let a guest close it for the others", async () => {
        const ana = await connect("ana", "m5");
        const guest = await connect("guest-1", "m5");
        await open(ana.socket, "object-1");
        await open(guest.socket, "object-1");

        expect(await closeForViewers(guest.socket, "object-1")).toEqual({
            ok: false,
            code: "CLOSE_OBJECT_FOR_VIEWERS_NOT_ALLOWED",
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(ana.closed).toEqual([]);
        cleanup();
    });

    it("forgets what a person had open when they disconnect", async () => {
        const ana = await connect("ana", "m6");
        await open(ana.socket, "object-1");

        ana.socket.close();
        await vi.waitFor(() =>
            expect(PresenceStore.listActiveObjects("m6")).toEqual([])
        );

        const late = await connect("dora", "m6");
        expect(late.joined.activeObjects).toEqual([]);
        cleanup();
    });
});
