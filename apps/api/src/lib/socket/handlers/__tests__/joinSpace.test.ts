import { beforeEach, describe, expect, it, vi } from "vitest";

const { canJoinSpaceMock } = vi.hoisted(() => ({
    canJoinSpaceMock: vi.fn(),
}));

vi.mock("../../services/canJoinSpace", () => ({
    canJoinSpace: canJoinSpaceMock,
}));

import { registerJoinSpace } from "../joinSpace";

function createFakeSocket(id: string, userId: string) {
    return {
        id,
        data: { userId, spaceId: null as string | null },
        join: vi.fn(),
        leave: vi.fn(),
        emit: vi.fn(),
        to: vi.fn().mockReturnValue({ emit: vi.fn() }),
        on: vi.fn(),
    };
}

function createFakeIo(peers: ReturnType<typeof createFakeSocket>[], room: string) {
    return {
        sockets: {
            adapter: { rooms: new Map([[room, new Set(peers.map((p) => p.id))]]) },
            sockets: new Map(peers.map((p) => [p.id, p])),
        },
    };
}

function getJoinHandler(socket: ReturnType<typeof createFakeSocket>) {
    return socket.on.mock.calls.find(([event]) => event === "space:join")?.[1];
}

const validPayload = {
    organizationId: "org-1",
    spaceId: "space-1",
    userId: "user-b",
};

describe("registerJoinSpace", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        canJoinSpaceMock.mockResolvedValue(true);
    });

    it("returns only the peers already present, snapshotted before joining", async () => {
        const peerA = createFakeSocket("socket-a", "user-a");
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([peerA], "space:space-1");

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(canJoinSpaceMock).toHaveBeenCalledWith("user-b", "org-1", "space-1");
        expect(socketB.join).toHaveBeenCalledWith("space:space-1");
        expect(socketB.data.spaceId).toBe("space-1");
        expect(socketB.emit).toHaveBeenCalledWith("space:joined", {
            peers: [{ socketId: "socket-a", userId: "user-a", avatarConfig: null }],
        });
    });

    it("notifies the room about the socket that just joined", async () => {
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([], "space:space-1");
        const toEmitMock = vi.fn();
        socketB.to.mockReturnValue({ emit: toEmitMock });

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(socketB.to).toHaveBeenCalledWith("space:space-1");
        expect(toEmitMock).toHaveBeenCalledWith("space:peer-joined", {
            socketId: "socket-b",
            userId: "user-b",
            avatarConfig: null,
        });
    });

    it("ignores a join whose userId does not match the authenticated socket", async () => {
        const socket = createFakeSocket("socket-a", "user-a");
        const io = createFakeIo([socket], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.({ ...validPayload, userId: "someone-else" });

        expect(socket.join).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalled();
        expect(canJoinSpaceMock).not.toHaveBeenCalled();
    });

    it("ignores an invalid payload", async () => {
        const socket = createFakeSocket("socket-a", "user-a");
        const io = createFakeIo([socket], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.({ spaceId: 123 });

        expect(socket.join).not.toHaveBeenCalled();
    });

    it("ignores the join when the user is not a member of the organization or the space does not exist", async () => {
        canJoinSpaceMock.mockResolvedValue(false);
        const socket = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.(validPayload);

        expect(socket.join).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalled();
    });

    it("does nothing when re-joining the space it is already in", async () => {
        const socket = createFakeSocket("socket-b", "user-b");
        socket.data.spaceId = "space-1";
        const io = createFakeIo([socket], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.(validPayload);

        expect(canJoinSpaceMock).not.toHaveBeenCalled();
        expect(socket.join).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalled();
    });

    it("leaves the previous space and notifies it before joining a new one", async () => {
        const socket = createFakeSocket("socket-b", "user-b");
        socket.data.spaceId = "space-old";
        const io = createFakeIo([], "space:space-1");
        const toEmitMock = vi.fn();
        socket.to.mockReturnValue({ emit: toEmitMock });

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.(validPayload);

        expect(socket.to).toHaveBeenCalledWith("space:space-old");
        expect(toEmitMock).toHaveBeenCalledWith("space:peer-left", {
            socketId: "socket-b",
            userId: "user-b",
        });
        expect(socket.leave).toHaveBeenCalledWith("space:space-old");
        expect(socket.join).toHaveBeenCalledWith("space:space-1");
    });
});
