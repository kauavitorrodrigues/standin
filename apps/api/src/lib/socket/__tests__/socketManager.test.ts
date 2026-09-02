import { beforeEach, describe, expect, it, vi } from "vitest";
import { SocketNotInitializedError } from "@standin/contracts";
import { SocketManager } from "../socketManager";

function createIoMock() {
    const emitMock = vi.fn();
    const toMock = vi.fn().mockReturnValue({ emit: emitMock });

    return {
        to: toMock,
        __emitMock: emitMock,
        __toMock: toMock,
    };
}

describe("SocketManager", () => {
    beforeEach(() => {
        // close() never nulls the instance itself (see socketManager.ts), so
        // tests reset it directly instead of relying on close().
        (SocketManager as unknown as { instance: unknown }).instance = null;
    });

    it("sets the server instance only once", () => {
        const io1 = createIoMock();
        const io2 = createIoMock();

        SocketManager.set(io1 as any);
        SocketManager.set(io2 as any);

        expect(SocketManager.get()).toBe(io1);
    });

    it("throws a typed SocketNotInitializedError when getting before the server is set", () => {
        expect(() => SocketManager.get()).toThrow(SocketNotInitializedError);
    });

    it("emits an event to an arbitrary room", () => {
        const io = createIoMock();
        SocketManager.set(io as any);

        SocketManager.emitToRoom("space:1", "space:peer-left", {
            socketId: "socket-a",
            userId: "user-1",
        });

        expect(io.__toMock).toHaveBeenCalledWith("space:1");
        expect(io.__emitMock).toHaveBeenCalledWith("space:peer-left", {
            socketId: "socket-a",
            userId: "user-1",
        });
    });

    it("emits an event to a single socket", () => {
        const io = createIoMock();
        SocketManager.set(io as any);

        SocketManager.emitToSocket("socket-a", "webrtc:signal", {
            fromSocketId: "socket-b",
            signal: { type: "offer" },
        });

        expect(io.__toMock).toHaveBeenCalledWith("socket-a");
        expect(io.__emitMock).toHaveBeenCalledWith("webrtc:signal", {
            fromSocketId: "socket-b",
            signal: { type: "offer" },
        });
    });

    it("throws a typed SocketNotInitializedError when emitting before the server is set", () => {
        expect(() =>
            SocketManager.emitToRoom("space:1", "space:peer-left", {
                socketId: "socket-a",
                userId: "user-1",
            })
        ).toThrow(SocketNotInitializedError);
    });

    it("closes the underlying server instance", async () => {
        const closeMock = vi.fn((cb: () => void) => cb());
        const io = createIoMock();
        SocketManager.set({ ...io, close: closeMock } as any);

        await SocketManager.close();

        expect(closeMock).toHaveBeenCalledTimes(1);
    });

    it("resolves without throwing when closing before the server is set", async () => {
        await expect(SocketManager.close()).resolves.toBeUndefined();
    });
});
