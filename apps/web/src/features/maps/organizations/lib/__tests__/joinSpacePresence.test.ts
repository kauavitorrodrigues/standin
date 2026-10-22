import { describe, expect, it, vi } from "vitest";
import { joinSpacePresence } from "../joinSpacePresence";
import type { PresenceSocket } from "../../types/presenceSocket";

const buildSocket = (connected: boolean) => {
    const listeners = new Set<() => void>();
    const socket: PresenceSocket = {
        connected,
        connect: vi.fn(),
        disconnect: vi.fn(),
        emit: vi.fn(),
        on: vi.fn((_event, listener) => listeners.add(listener)),
        off: vi.fn((_event, listener) => listeners.delete(listener)),
    };
    return { socket, listeners };
};

const input = { spaceId: "space" };

describe("joinSpacePresence", () => {
    it("connects and joins on connect when the socket is closed", () => {
        const { socket, listeners } = buildSocket(false);
        joinSpacePresence({ socket, ...input });

        expect(socket.connect).toHaveBeenCalledOnce();
        expect(socket.emit).not.toHaveBeenCalled();

        listeners.forEach((listener) => listener());
        expect(socket.emit).toHaveBeenCalledWith("space:join", input);
    });

    it("joins right away when the socket is already connected", () => {
        const { socket } = buildSocket(true);
        joinSpacePresence({ socket, ...input });

        expect(socket.connect).not.toHaveBeenCalled();
        expect(socket.emit).toHaveBeenCalledWith("space:join", input);
    });

    it("sends nothing but the space, the server decides who joins and where", () => {
        const { socket } = buildSocket(true);
        joinSpacePresence({ socket, ...input });

        expect(socket.emit).toHaveBeenCalledWith("space:join", {
            spaceId: "space",
        });
    });

    it("removes the listener and disconnects on teardown", () => {
        const { socket, listeners } = buildSocket(false);
        const teardown = joinSpacePresence({ socket, ...input });

        teardown();

        expect(listeners.size).toBe(0);
        expect(socket.disconnect).toHaveBeenCalledOnce();
    });
});
