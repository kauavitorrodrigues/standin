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

const { canJoinSpaceMock, resolveSheetMock } = vi.hoisted(() => ({
    canJoinSpaceMock: vi.fn(),
    resolveSheetMock: vi.fn(),
}));

vi.mock("../../services/canJoinSpace", () => ({
    canJoinSpace: canJoinSpaceMock,
}));
vi.mock("../../services/isSpaceOwner", () => ({
    isSpaceOwner: vi.fn().mockResolvedValue(false),
}));
vi.mock("../../services/resolveAvatarSheetFileId", () => ({
    resolveAvatarSheetFileId: resolveSheetMock,
}));

import { registerJoinSpace } from "../joinSpace";
import { registerDisconnect } from "../disconnect";
import { broadcastAvatarChange } from "../../services/broadcastAvatarChange";
import { SocketManager } from "../../socketManager";
import { RoomStates } from "../../utils/roomStates";
import { buildUserRoom } from "../../utils/buildUserRoom";

type AvatarChanged = { userId: string; avatarSheetFileId: string | null };

// Real socket.io server and clients over a local port, with the real join
// handler and the real broadcast. Only the auth middleware, the permission
// check and the lookup of the sheet are stubbed.
describe("avatar change with several clients in a space", () => {
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
        const changes: AvatarChanged[] = [];
        socket.on("space:avatar-changed", (change: AvatarChanged) =>
            changes.push(change)
        );
        clients.push(socket);
        await new Promise<void>((resolve) =>
            socket.once("connect", () => resolve())
        );
        const joined = new Promise<void>((resolve) =>
            socket.once("space:joined", () => resolve())
        );
        socket.emit("space:join", { organizationId: "org", spaceId, userId });
        await joined;
        return { socket, changes };
    };

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
            // The server joins the room of the user on connection.
            socket.join(buildUserRoom(socket.data.userId));
            registerJoinSpace(io, socket);
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
        canJoinSpaceMock.mockResolvedValue(true);
        resolveSheetMock.mockResolvedValue(null);
    });

    const cleanup = () => {
        clients.forEach((socket) => socket.close());
        clients = [];
    };

    it("tells the other client in the space that the sheet changed", async () => {
        const ana = await connect("ana", "s1");
        const bruno = await connect("bruno", "s1");

        await broadcastAvatarChange({
            userId: "ana",
            avatarSheetFileId: "file-2",
        });

        await vi.waitFor(() =>
            expect(bruno.changes).toEqual([
                { userId: "ana", avatarSheetFileId: "file-2" },
            ])
        );
        expect(ana.changes).toEqual([
            { userId: "ana", avatarSheetFileId: "file-2" },
        ]);
        cleanup();
    });

    it("sends null when the avatar is cleared", async () => {
        const ana = await connect("ana", "s2");
        const bruno = await connect("bruno", "s2");

        await broadcastAvatarChange({ userId: "ana", avatarSheetFileId: null });

        await vi.waitFor(() =>
            expect(bruno.changes).toEqual([
                { userId: "ana", avatarSheetFileId: null },
            ])
        );
        expect(ana.changes).toHaveLength(1);
        cleanup();
    });

    it("does not reach a client in another space", async () => {
        await connect("ana", "s3");
        const carla = await connect("carla", "s4");
        const bruno = await connect("bruno", "s3");

        await broadcastAvatarChange({
            userId: "ana",
            avatarSheetFileId: "file-3",
        });

        await vi.waitFor(() => expect(bruno.changes).toHaveLength(1));
        expect(carla.changes).toEqual([]);
        cleanup();
    });
});
