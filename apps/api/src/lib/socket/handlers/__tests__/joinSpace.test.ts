import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    resolveJoinAccessMock,
    resolveAvatarSheetFileIdMock,
    resolveUserProfilesMock,
    listPendingMock,
} = vi.hoisted(() => ({
    resolveJoinAccessMock: vi.fn(),
    listPendingMock: vi.fn(),
    resolveAvatarSheetFileIdMock: vi.fn(),
    resolveUserProfilesMock: vi.fn(),
}));

vi.mock("../../services/resolveUserProfiles", () => ({
    resolveUserProfiles: resolveUserProfilesMock,
}));

vi.mock("../../services/resolveAvatarSheetFileId", () => ({
    resolveAvatarSheetFileId: resolveAvatarSheetFileIdMock,
}));

vi.mock("../../services/resolveJoinAccess", () => ({
    resolveJoinAccess: resolveJoinAccessMock,
}));

vi.mock("@standin/core", () => ({
    SpaceGuestService: { listPending: listPendingMock },
    AvatarService: { ensureSheetUpToDate: async () => null },
}));

import { registerJoinSpace } from "../joinSpace";

function createFakeSocket(id: string, userId: string) {
    return {
        id,
        data: {
            userId,
            spaceId: null as string | null,
            isGuest: undefined as boolean | undefined,
        },
        join: vi.fn(),
        leave: vi.fn(),
        emit: vi.fn(),
        to: vi.fn().mockReturnValue({ emit: vi.fn() }),
        on: vi.fn(),
        disconnect: vi.fn(),
    };
}

function createFakeIo(
    peers: ReturnType<typeof createFakeSocket>[],
    room: string
) {
    return {
        sockets: {
            adapter: {
                rooms: new Map([[room, new Set(peers.map((p) => p.id))]]),
            },
            sockets: new Map(peers.map((p) => [p.id, p])),
        },
    };
}

function getJoinHandler(socket: ReturnType<typeof createFakeSocket>) {
    return socket.on.mock.calls.find(([event]) => event === "space:join")?.[1];
}

const validPayload = { spaceId: "space-1" };

const MEMBER = { isHost: true, isOwner: false };
const GUEST = { isHost: false, isOwner: false };

describe("registerJoinSpace", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resolveJoinAccessMock.mockResolvedValue(GUEST);
        listPendingMock.mockResolvedValue([]);
        resolveAvatarSheetFileIdMock.mockResolvedValue(null);
        resolveUserProfilesMock.mockResolvedValue(
            new Map([
                ["user-a", { name: "Ana", profilePictureUrl: "/files/ana" }],
                ["user-b", { name: "Bruno", profilePictureUrl: null }],
            ])
        );
    });

    it("returns only the peers already present, snapshotted before joining", async () => {
        const peerA = createFakeSocket("socket-a", "user-a");
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([peerA], "space:space-1");

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(resolveJoinAccessMock).toHaveBeenCalledWith("user-b", "space-1");
        expect(socketB.join).toHaveBeenCalledWith("space:space-1");
        expect(socketB.data.spaceId).toBe("space-1");
        expect(socketB.emit).toHaveBeenCalledWith("space:joined", {
            peers: [
                {
                    socketId: "socket-a",
                    userId: "user-a",
                    avatarSheetFileId: null,
                    name: "Ana",
                    profilePictureUrl: "/files/ana",
                },
            ],
        });
    });

    it("sends the avatar sheet of each peer already present", async () => {
        resolveAvatarSheetFileIdMock.mockImplementation(
            async (userId: string) => (userId === "user-a" ? "file-a" : null)
        );
        const peerA = createFakeSocket("socket-a", "user-a");
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([peerA], "space:space-1");

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(resolveAvatarSheetFileIdMock).toHaveBeenCalledWith("user-a");
        expect(socketB.emit).toHaveBeenCalledWith("space:joined", {
            peers: [
                {
                    socketId: "socket-a",
                    userId: "user-a",
                    avatarSheetFileId: "file-a",
                    name: "Ana",
                    profilePictureUrl: "/files/ana",
                },
            ],
        });
    });

    it("announces the avatar sheet of the socket that just joined", async () => {
        resolveAvatarSheetFileIdMock.mockResolvedValue("file-b");
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([], "space:space-1");
        const toEmitMock = vi.fn();
        socketB.to.mockReturnValue({ emit: toEmitMock });

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(resolveAvatarSheetFileIdMock).toHaveBeenCalledWith("user-b");
        expect(toEmitMock).toHaveBeenCalledWith("space:peer-joined", {
            socketId: "socket-b",
            userId: "user-b",
            avatarSheetFileId: "file-b",
            name: "Bruno",
            profilePictureUrl: null,
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
            avatarSheetFileId: null,
            name: "Bruno",
            profilePictureUrl: null,
        });
    });

    it("reads the profiles of the peers and of the joiner in one query", async () => {
        const peerA = createFakeSocket("socket-a", "user-a");
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([peerA], "space:space-1");

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(resolveUserProfilesMock).toHaveBeenCalledTimes(1);
        expect(resolveUserProfilesMock).toHaveBeenCalledWith([
            "user-b",
            "user-a",
        ]);
    });

    it("sends an empty name and no photo when the profile could not be read", async () => {
        resolveUserProfilesMock.mockResolvedValue(new Map());
        const peerA = createFakeSocket("socket-a", "user-a");
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([peerA], "space:space-1");

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(socketB.emit).toHaveBeenCalledWith("space:joined", {
            peers: [
                {
                    socketId: "socket-a",
                    userId: "user-a",
                    avatarSheetFileId: null,
                    name: "",
                    profilePictureUrl: null,
                },
            ],
        });
    });

    it("trusts the token and the database, never an organization or user sent by the client", async () => {
        const socket = createFakeSocket("socket-a", "user-a");
        const io = createFakeIo([], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.({
            ...validPayload,
            userId: "someone-else",
            organizationId: "org-of-someone-else",
        });

        expect(resolveJoinAccessMock).toHaveBeenCalled();
        for (const call of resolveJoinAccessMock.mock.calls) {
            expect(call).toEqual(["user-a", "space-1"]);
        }
    });

    it("ignores an invalid payload", async () => {
        const socket = createFakeSocket("socket-a", "user-a");
        const io = createFakeIo([socket], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.({ spaceId: 123 });

        expect(socket.join).not.toHaveBeenCalled();
    });

    it("ignores the join when the user is neither a member nor an admitted guest, or the space does not exist", async () => {
        resolveJoinAccessMock.mockResolvedValue(null);
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

        expect(resolveJoinAccessMock).not.toHaveBeenCalled();
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

    it("disconnects an older connection from the same account already in the room", async () => {
        const staleSocket = createFakeSocket("socket-stale", "user-b");
        const newSocket = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([staleSocket], "space:space-1");

        registerJoinSpace(io as any, newSocket as any);
        await getJoinHandler(newSocket)?.(validPayload);

        expect(staleSocket.emit).toHaveBeenCalledWith(
            "space:duplicate-session"
        );
        expect(staleSocket.disconnect).toHaveBeenCalledWith(true);
        expect(newSocket.emit).toHaveBeenCalledWith("space:joined", {
            peers: [],
        });
    });

    it("does not touch peers belonging to a different account", async () => {
        const peerA = createFakeSocket("socket-a", "user-a");
        const newSocket = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([peerA], "space:space-1");

        registerJoinSpace(io as any, newSocket as any);
        await getJoinHandler(newSocket)?.(validPayload);

        expect(peerA.emit).not.toHaveBeenCalledWith("space:duplicate-session");
        expect(peerA.disconnect).not.toHaveBeenCalled();
    });

    it("puts a host in the host room and tells them who is waiting", async () => {
        resolveJoinAccessMock.mockResolvedValue(MEMBER);
        const waiting = { id: "g1", spaceId: "space-1", name: "Caio" };
        listPendingMock.mockResolvedValue([waiting]);
        const socket = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.(validPayload);

        expect(socket.join).toHaveBeenCalledWith("space-hosts:space-1");
        expect(listPendingMock).toHaveBeenCalledWith("space-1");
        expect(socket.emit).toHaveBeenCalledWith("space:guest-requested", {
            guest: waiting,
        });
    });

    it("keeps a guest out of the host room and away from the requests", async () => {
        resolveJoinAccessMock.mockResolvedValue(GUEST);
        const socket = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.(validPayload);

        expect(socket.join).not.toHaveBeenCalledWith("space-hosts:space-1");
        expect(listPendingMock).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalledWith(
            "space:guest-requested",
            expect.anything()
        );
    });

    it("leaves the host room of the previous space", async () => {
        const socket = createFakeSocket("socket-b", "user-b");
        socket.data.spaceId = "space-old";
        const io = createFakeIo([], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.(validPayload);

        expect(socket.leave).toHaveBeenCalledWith("space-hosts:space-old");
    });

    it("marks a guest socket as a guest and a member as not", async () => {
        const guestSocket = createFakeSocket("socket-g", "user-g");
        resolveJoinAccessMock.mockResolvedValue(GUEST);
        registerJoinSpace(
            createFakeIo([], "space:space-1") as any,
            guestSocket as any
        );
        await getJoinHandler(guestSocket)?.(validPayload);

        const memberSocket = createFakeSocket("socket-m", "user-m");
        resolveJoinAccessMock.mockResolvedValue(MEMBER);
        registerJoinSpace(
            createFakeIo([], "space:space-1") as any,
            memberSocket as any
        );
        await getJoinHandler(memberSocket)?.(validPayload);

        expect(guestSocket.data.isGuest).toBe(true);
        expect(memberSocket.data.isGuest).toBe(false);
    });

    it("looks again at a guest once inside, and puts out one whose pass ended meanwhile", async () => {
        resolveJoinAccessMock
            .mockResolvedValueOnce(GUEST)
            .mockResolvedValueOnce(null);
        const socket = createFakeSocket("socket-g", "user-g");
        registerJoinSpace(
            createFakeIo([], "space:space-1") as any,
            socket as any
        );

        await getJoinHandler(socket)?.(validPayload);

        expect(resolveJoinAccessMock).toHaveBeenCalledTimes(2);
        expect(socket.leave).toHaveBeenCalledWith("space:space-1");
        expect(socket.data.spaceId).toBeNull();
        expect(socket.emit).not.toHaveBeenCalledWith(
            "space:joined",
            expect.anything()
        );
    });

    it("does not look again at a member: the organization does not end by itself in a join", async () => {
        resolveJoinAccessMock.mockResolvedValue(MEMBER);
        const socket = createFakeSocket("socket-m", "user-m");
        registerJoinSpace(
            createFakeIo([], "space:space-1") as any,
            socket as any
        );

        await getJoinHandler(socket)?.(validPayload);

        expect(resolveJoinAccessMock).toHaveBeenCalledTimes(1);
    });
});
