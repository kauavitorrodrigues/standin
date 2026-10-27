import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    resolveJoinAccessMock,
    recheckAccessMock,
    resolveAvatarSheetFileIdMock,
    resolveUserProfileMock,
    listPendingMock,
    resolveSpaceSettingsMock,
} = vi.hoisted(() => ({
    resolveSpaceSettingsMock: vi.fn(),
    resolveJoinAccessMock: vi.fn(),
    recheckAccessMock: vi.fn(),
    listPendingMock: vi.fn(),
    resolveAvatarSheetFileIdMock: vi.fn(),
    resolveUserProfileMock: vi.fn(),
}));

vi.mock("../../services/resolveUserProfile", () => ({
    resolveUserProfile: resolveUserProfileMock,
}));

vi.mock("../../services/resolveSpaceSettings", () => ({
    resolveSpaceSettings: resolveSpaceSettingsMock,
}));

vi.mock("../../services/resolveAvatarSheetFileId", () => ({
    resolveAvatarSheetFileId: resolveAvatarSheetFileIdMock,
}));

vi.mock("../../services/resolveCachedJoinAccess", () => ({
    resolveCachedJoinAccess: resolveJoinAccessMock,
}));

vi.mock("../../services/resolveJoinAccess", () => ({
    resolveJoinAccess: recheckAccessMock,
}));

vi.mock("@standin/core", () => ({
    SpaceGuestService: { listPending: listPendingMock },
    AvatarService: { ensureSheetUpToDate: async () => null },
}));

import { registerJoinSpace } from "../joinSpace";
import { PresenceStore } from "../../presence/PresenceStore";

function createFakeSocket(id: string, userId: string) {
    return {
        id,
        data: {
            userId,
            spaceId: null as string | null,
            isGuest: undefined as boolean | undefined,
        },
        connected: true,
        join: vi.fn(),
        leave: vi.fn(),
        emit: vi.fn(),
        to: vi.fn().mockReturnValue({ emit: vi.fn() }),
        on: vi.fn(),
        disconnect: vi.fn(),
    };
}

const PROFILES: Record<
    string,
    { name: string; profilePictureUrl: string | null }
> = {
    "user-a": { name: "Ana", profilePictureUrl: "/files/ana" },
    "user-b": { name: "Bruno", profilePictureUrl: null },
};

// The sockets are in the space already: they sit in the room and in the
// presence, which is where a join reads who is inside.
function createFakeIo(
    peers: ReturnType<typeof createFakeSocket>[],
    room: string,
    sheets: Record<string, string | null> = {}
) {
    peers.forEach((peer) => {
        PresenceStore.add(room.replace("space:", ""), {
            socketId: peer.id,
            userId: peer.data.userId,
            avatarSheetFileId: sheets[peer.data.userId] ?? null,
            ...(PROFILES[peer.data.userId] ?? {
                name: "",
                profilePictureUrl: null,
            }),
        });
    });
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
        PresenceStore.clear();
        resolveJoinAccessMock.mockResolvedValue(GUEST);
        recheckAccessMock.mockResolvedValue(GUEST);
        listPendingMock.mockResolvedValue([]);
        resolveSpaceSettingsMock.mockResolvedValue({
            enableSendNearbyInMapView: true,
        });
        resolveAvatarSheetFileIdMock.mockResolvedValue(null);
        resolveUserProfileMock.mockImplementation(
            async (userId: string) =>
                PROFILES[userId] ?? { name: "", profilePictureUrl: null }
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
            settings: { enableSendNearbyInMapView: true },
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

    it("sends the avatar sheet of each peer already present, without reading it again", async () => {
        const peerA = createFakeSocket("socket-a", "user-a");
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([peerA], "space:space-1", {
            "user-a": "file-a",
        });

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(resolveAvatarSheetFileIdMock).not.toHaveBeenCalledWith(
            "user-a"
        );
        expect(socketB.emit).toHaveBeenCalledWith("space:joined", {
            settings: { enableSendNearbyInMapView: true },
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

    it("reads only the profile and the sheet of the person who joins", async () => {
        const peerA = createFakeSocket("socket-a", "user-a");
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([peerA], "space:space-1");

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(resolveUserProfileMock).toHaveBeenCalledTimes(1);
        expect(resolveUserProfileMock).toHaveBeenCalledWith("user-b");
        expect(resolveAvatarSheetFileIdMock).toHaveBeenCalledTimes(1);
        expect(resolveAvatarSheetFileIdMock).toHaveBeenCalledWith("user-b");
    });

    it("announces an empty name and no photo when the profile could not be read", async () => {
        resolveUserProfileMock.mockResolvedValue({
            name: "",
            profilePictureUrl: null,
        });
        const socketB = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([], "space:space-1");
        const toEmitMock = vi.fn();
        socketB.to.mockReturnValue({ emit: toEmitMock });

        registerJoinSpace(io as any, socketB as any);
        await getJoinHandler(socketB)?.(validPayload);

        expect(toEmitMock).toHaveBeenCalledWith(
            "space:peer-joined",
            expect.objectContaining({ name: "", profilePictureUrl: null })
        );
    });

    it("puts the joiner in the presence and takes the socket out when it leaves", async () => {
        const socket = createFakeSocket("socket-b", "user-b");
        const io = createFakeIo([], "space:space-1");

        registerJoinSpace(io as any, socket as any);
        await getJoinHandler(socket)?.(validPayload);

        expect(PresenceStore.get("space-1", "socket-b")).toEqual({
            socketId: "socket-b",
            userId: "user-b",
            avatarSheetFileId: null,
            name: "Bruno",
            profilePictureUrl: null,
        });

        socket.data.spaceId = "space-1";
        await getJoinHandler(socket)?.({ spaceId: "space-2" });
        expect(PresenceStore.get("space-1", "socket-b")).toBeUndefined();
        expect(PresenceStore.get("space-2", "socket-b")).toBeDefined();
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
            settings: { enableSendNearbyInMapView: true },
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

    it("looks again at a guest once inside, in the database, and puts out one whose pass ended meanwhile", async () => {
        resolveJoinAccessMock.mockResolvedValue(GUEST);
        recheckAccessMock.mockResolvedValue(null);
        const socket = createFakeSocket("socket-g", "user-g");
        registerJoinSpace(
            createFakeIo([], "space:space-1") as any,
            socket as any
        );

        await getJoinHandler(socket)?.(validPayload);

        expect(resolveJoinAccessMock).toHaveBeenCalledTimes(1);
        expect(recheckAccessMock).toHaveBeenCalledWith("user-g", "space-1");
        expect(socket.leave).toHaveBeenCalledWith("space:space-1");
        expect(socket.data.spaceId).toBeNull();
        expect(PresenceStore.get("space-1", "socket-g")).toBeUndefined();
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
        expect(recheckAccessMock).not.toHaveBeenCalled();
    });

    it("leaves no presence behind when the socket drops while the profile is being read", async () => {
        const socket = createFakeSocket("socket-b", "user-b");
        resolveUserProfileMock.mockImplementation(async () => {
            socket.connected = false;
            return { name: "Bruno", profilePictureUrl: null };
        });
        registerJoinSpace(
            createFakeIo([], "space:space-1") as any,
            socket as any
        );

        await getJoinHandler(socket)?.(validPayload);

        expect(PresenceStore.get("space-1", "socket-b")).toBeUndefined();
        expect(socket.join).not.toHaveBeenCalled();
        expect(socket.data.spaceId).toBeNull();
    });

    it("announces nobody when the socket drops while entering the room", async () => {
        const socket = createFakeSocket("socket-b", "user-b");
        const toEmit = vi.fn();
        socket.to.mockReturnValue({ emit: toEmit });
        socket.join.mockImplementation(async () => {
            socket.connected = false;
        });
        registerJoinSpace(
            createFakeIo([], "space:space-1") as any,
            socket as any
        );

        await getJoinHandler(socket)?.(validPayload);

        expect(toEmit).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalledWith(
            "space:joined",
            expect.anything()
        );
    });
});
