import { beforeEach, describe, expect, it, vi } from "vitest";

const { emitToSocketMock } = vi.hoisted(() => ({
    emitToSocketMock: vi.fn(),
}));

vi.mock("../../socketManager", () => ({
    SocketManager: { emitToSocket: emitToSocketMock },
}));

import { registerWebrtcSignal } from "../webrtcSignal";

function createFakeSocket(id: string, spaceId: string | null) {
    return { id, data: { spaceId }, on: vi.fn() };
}

function createFakeIo(room: string, socketIdsInRoom: string[]) {
    return {
        sockets: { adapter: { rooms: new Map([[room, new Set(socketIdsInRoom)]]) } },
    };
}

function getSignalHandler(socket: ReturnType<typeof createFakeSocket>) {
    return socket.on.mock.calls.find(([event]) => event === "webrtc:signal")?.[1];
}

describe("registerWebrtcSignal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("relays the signal to a target that is in the same space", () => {
        const socket = createFakeSocket("socket-a", "space-1");
        const io = createFakeIo("space:space-1", ["socket-a", "socket-b"]);

        registerWebrtcSignal(io as any, socket as any);
        getSignalHandler(socket)?.({
            targetSocketId: "socket-b",
            signal: { type: "offer" },
        });

        expect(emitToSocketMock).toHaveBeenCalledWith(
            "socket-b",
            "webrtc:signal",
            { fromSocketId: "socket-a", signal: { type: "offer" } }
        );
    });

    it("drops the signal when the sender never joined a space", () => {
        const socket = createFakeSocket("socket-a", null);
        const io = createFakeIo("space:space-1", ["socket-a", "socket-b"]);

        registerWebrtcSignal(io as any, socket as any);
        getSignalHandler(socket)?.({
            targetSocketId: "socket-b",
            signal: { type: "offer" },
        });

        expect(emitToSocketMock).not.toHaveBeenCalled();
    });

    it("drops the signal when the target is not in the sender's space", () => {
        const socket = createFakeSocket("socket-a", "space-1");
        const io = createFakeIo("space:space-1", ["socket-a"]);

        registerWebrtcSignal(io as any, socket as any);
        getSignalHandler(socket)?.({
            targetSocketId: "socket-not-in-room",
            signal: { type: "offer" },
        });

        expect(emitToSocketMock).not.toHaveBeenCalled();
    });

    it("drops an invalid payload instead of throwing", () => {
        const socket = createFakeSocket("socket-a", "space-1");
        const io = createFakeIo("space:space-1", ["socket-a"]);

        registerWebrtcSignal(io as any, socket as any);

        expect(() => getSignalHandler(socket)?.(undefined)).not.toThrow();
        expect(emitToSocketMock).not.toHaveBeenCalled();
    });
});
