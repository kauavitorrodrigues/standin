import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    serverInstanceMock,
    ServerMock,
    setMock,
    requiresSocketAuthMock,
    registerJoinSpaceMock,
    registerWebrtcSignalMock,
    registerDisconnectMock,
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
        registerWebrtcSignalMock: vi.fn(),
        registerDisconnectMock: vi.fn(),
    };
});

vi.mock("socket.io", () => ({
    Server: ServerMock,
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

vi.mock("../handlers/webrtcSignal", () => ({
    registerWebrtcSignal: registerWebrtcSignalMock,
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

        const fakeSocket = { id: "socket-1" };
        connectionHandler(fakeSocket);

        expect(registerJoinSpaceMock).toHaveBeenCalledWith(
            serverInstanceMock,
            fakeSocket
        );
        expect(registerWebrtcSignalMock).toHaveBeenCalledWith(
            serverInstanceMock,
            fakeSocket
        );
        expect(registerDisconnectMock).toHaveBeenCalledWith(fakeSocket);
    });
});
