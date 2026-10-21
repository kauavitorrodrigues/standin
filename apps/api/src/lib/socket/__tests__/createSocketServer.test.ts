import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    serverInstanceMock,
    ServerMock,
    setMock,
    requiresSocketAuthMock,
    registerJoinSpaceMock,
    registerJoinMapMock,
    registerEditorAcquireMock,
    registerEditorHeartbeatMock,
    registerEditorReleaseMock,
    registerWebrtcSignalMock,
    registerDisconnectMock,
    onSheetChangedMock,
    onNameChangedMock,
    onProfilePictureChangedMock,
} = vi.hoisted(() => {
    const useMock = vi.fn();
    const onMock = vi.fn();

    const serverInstanceMock = {
        use: useMock,
        on: onMock,
        __useMock: useMock,
        __onMock: onMock,
    };

    return {
        serverInstanceMock,
        ServerMock: vi.fn(function () {
            return serverInstanceMock;
        }),
        setMock: vi.fn(),
        requiresSocketAuthMock: vi.fn(),
        registerJoinSpaceMock: vi.fn(),
        registerJoinMapMock: vi.fn(),
        registerEditorAcquireMock: vi.fn(),
        registerEditorHeartbeatMock: vi.fn(),
        registerEditorReleaseMock: vi.fn(),
        registerWebrtcSignalMock: vi.fn(),
        registerDisconnectMock: vi.fn(),
        onSheetChangedMock: vi.fn(),
        onNameChangedMock: vi.fn(),
        onProfilePictureChangedMock: vi.fn(),
    };
});

vi.mock("socket.io", () => ({
    Server: ServerMock,
}));

vi.mock("@standin/core", () => ({
    AvatarService: { onSheetChanged: onSheetChangedMock },
    UserService: {
        onNameChanged: onNameChangedMock,
        onProfilePictureChanged: onProfilePictureChangedMock,
    },
}));

vi.mock("../services/broadcastNameChange", () => ({
    broadcastNameChange: vi.fn(),
}));
vi.mock("../services/broadcastProfilePictureChange", () => ({
    broadcastProfilePictureChange: vi.fn(),
}));
vi.mock("../services/broadcastAvatarChange", () => ({
    broadcastAvatarChange: vi.fn(),
}));

vi.mock("@/consts/server", () => ({
    corsSocketOptions: { origin: "http://localhost:5173", credentials: true },
}));

vi.mock("../socketManager", () => ({
    SocketManager: { set: setMock },
}));

vi.mock("../middlewares/requiresAuth", () => ({
    requiresSocketAuth: requiresSocketAuthMock,
}));

vi.mock("../handlers/joinSpace", () => ({
    registerJoinSpace: registerJoinSpaceMock,
}));

vi.mock("../handlers/editorAcquire", () => ({
    registerEditorAcquire: registerEditorAcquireMock,
}));

vi.mock("../handlers/editorHeartbeat", () => ({
    registerEditorHeartbeat: registerEditorHeartbeatMock,
}));

vi.mock("../handlers/editorRelease", () => ({
    registerEditorRelease: registerEditorReleaseMock,
}));

vi.mock("../handlers/joinMap", () => ({
    registerJoinMap: registerJoinMapMock,
}));

vi.mock("../handlers/webrtcSignal", () => ({
    registerWebrtcSignal: registerWebrtcSignalMock,
}));

vi.mock("../handlers/roomCrossed", () => ({ registerRoomCrossed: vi.fn() }));
vi.mock("../handlers/roomOpen", () => ({ registerRoomOpen: vi.fn() }));
vi.mock("../handlers/roomPresent", () => ({ registerRoomPresent: vi.fn() }));
vi.mock("../handlers/roomLock", () => ({ registerRoomLock: vi.fn() }));
vi.mock("../handlers/roomUnlock", () => ({ registerRoomUnlock: vi.fn() }));
vi.mock("../handlers/roomJoinRequest", () => ({
    registerRoomJoinRequest: vi.fn(),
}));
vi.mock("../handlers/roomJoinAnswer", () => ({
    registerRoomJoinAnswer: vi.fn(),
}));

vi.mock("../handlers/disconnect", () => ({
    registerDisconnect: registerDisconnectMock,
}));

import { createSocketServer } from "../createSocketServer";

describe("createSocketServer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("configures cors using corsSocketOptions", () => {
        createSocketServer({} as any);

        expect(ServerMock).toHaveBeenCalledWith(
            {},
            expect.objectContaining({
                cors: expect.objectContaining({
                    origin: "http://localhost:5173",
                    credentials: true,
                }),
            })
        );
    });

    it("registers the auth middleware", () => {
        createSocketServer({} as any);

        expect(serverInstanceMock.__useMock).toHaveBeenCalledWith(
            requiresSocketAuthMock
        );
    });

    it("registers the server instance on the SocketManager singleton", () => {
        createSocketServer({} as any);

        expect(setMock).toHaveBeenCalledWith(serverInstanceMock);
    });

    it("registers the signaling handlers on connection", () => {
        createSocketServer({} as any);

        const connectionHandler = serverInstanceMock.__onMock.mock.calls.find(
            ([event]) => event === "connection"
        )?.[1] as (socket: any) => void;

        const joinMock = vi.fn();
        const fakeSocket = {
            id: "socket-1",
            data: { userId: "user-1" },
            join: joinMock,
        };
        connectionHandler(fakeSocket);

        expect(registerJoinSpaceMock).toHaveBeenCalledWith(
            serverInstanceMock,
            fakeSocket
        );
        expect(registerJoinMapMock).toHaveBeenCalledWith(fakeSocket);
        expect(registerEditorAcquireMock).toHaveBeenCalledWith(fakeSocket);
        expect(registerEditorHeartbeatMock).toHaveBeenCalledWith(fakeSocket);
        expect(registerEditorReleaseMock).toHaveBeenCalledWith(fakeSocket);
        expect(registerWebrtcSignalMock).toHaveBeenCalledWith(
            serverInstanceMock,
            fakeSocket
        );
        expect(registerDisconnectMock).toHaveBeenCalledWith(fakeSocket);
    });

    it("registers the avatar sheet listener once per server", async () => {
        createSocketServer({} as any);

        const { broadcastAvatarChange } =
            await import("../services/broadcastAvatarChange");
        expect(onSheetChangedMock).toHaveBeenCalledTimes(1);
        expect(onSheetChangedMock).toHaveBeenCalledWith(broadcastAvatarChange);
    });

    it("registers the name listener once per server", async () => {
        createSocketServer({} as any);

        const { broadcastNameChange } =
            await import("../services/broadcastNameChange");
        expect(onNameChangedMock).toHaveBeenCalledTimes(1);
        expect(onNameChangedMock).toHaveBeenCalledWith(broadcastNameChange);
    });

    it("registers the profile picture listener once per server", async () => {
        createSocketServer({} as any);

        const { broadcastProfilePictureChange } =
            await import("../services/broadcastProfilePictureChange");
        expect(onProfilePictureChangedMock).toHaveBeenCalledTimes(1);
        expect(onProfilePictureChangedMock).toHaveBeenCalledWith(
            broadcastProfilePictureChange
        );
    });

    it("joins the socket to its own user room on connection", () => {
        createSocketServer({} as any);

        const connectionHandler = serverInstanceMock.__onMock.mock.calls.find(
            ([event]) => event === "connection"
        )?.[1] as (socket: any) => void;

        const joinMock = vi.fn();
        const fakeSocket = {
            id: "socket-1",
            data: { userId: "user-1" },
            join: joinMock,
        };
        connectionHandler(fakeSocket);

        expect(joinMock).toHaveBeenCalledWith("user:user-1");
    });
});
