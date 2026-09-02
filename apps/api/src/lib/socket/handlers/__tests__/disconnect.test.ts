import { describe, expect, it, vi } from "vitest";
import { registerDisconnect } from "../disconnect";

function createFakeSocket(id: string, userId: string, spaceId: string | null) {
    const emit = vi.fn();
    return {
        id,
        data: { userId, spaceId },
        to: vi.fn().mockReturnValue({ emit }),
        on: vi.fn(),
        __emit: emit,
    };
}

function getDisconnectHandler(socket: ReturnType<typeof createFakeSocket>) {
    return socket.on.mock.calls.find(([event]) => event === "disconnect")?.[1];
}

describe("registerDisconnect", () => {
    it("notifies the space room that the peer left", () => {
        const socket = createFakeSocket("socket-a", "user-a", "space-1");

        registerDisconnect(socket as any);
        getDisconnectHandler(socket)?.();

        expect(socket.to).toHaveBeenCalledWith("space:space-1");
        expect(socket.__emit).toHaveBeenCalledWith("space:peer-left", {
            socketId: "socket-a",
            userId: "user-a",
        });
    });

    it("does nothing when the socket never joined a space", () => {
        const socket = createFakeSocket("socket-a", "user-a", null);

        registerDisconnect(socket as any);
        getDisconnectHandler(socket)?.();

        expect(socket.to).not.toHaveBeenCalled();
    });
});
