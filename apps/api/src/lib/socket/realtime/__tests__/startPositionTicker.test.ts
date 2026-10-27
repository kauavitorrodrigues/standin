import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { reliableMock, volatileMock, flushAllMock } = vi.hoisted(() => ({
    reliableMock: vi.fn(),
    volatileMock: vi.fn(),
    flushAllMock: vi.fn(),
}));

vi.mock("../../socketManager", () => ({
    SocketManager: {
        emitToSocket: reliableMock,
        emitVolatileToSocket: volatileMock,
    },
}));
vi.mock("../SpaceInterests", () => ({
    SpaceInterests: { flushAll: flushAllMock },
}));

import { startPositionTicker } from "../startPositionTicker";

type Send = (spaceId: string, socketId: string, payload: unknown) => void;

const sendWith = (payload: unknown) => {
    flushAllMock.mockImplementation((send: Send) => send("s", "sock-1", payload));
    vi.advanceTimersByTime(100);
};

describe("startPositionTicker", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });
    afterEach(() => vi.useRealTimers());

    it("sends a message that only moves people as volatile", () => {
        const stop = startPositionTicker(100);

        sendWith({ entered: [], moved: [[1, 1, 1, 1]], left: [] });

        expect(volatileMock).toHaveBeenCalledOnce();
        expect(reliableMock).not.toHaveBeenCalled();
        stop();
    });

    it("sends a message with someone entering as reliable", () => {
        const stop = startPositionTicker(100);

        sendWith({ entered: [[1, 1, 1, 1, "x"]], moved: [], left: [] });

        expect(reliableMock).toHaveBeenCalledOnce();
        expect(volatileMock).not.toHaveBeenCalled();
        stop();
    });

    it("sends a message with someone leaving as reliable", () => {
        const stop = startPositionTicker(100);

        sendWith({ entered: [], moved: [], left: [3] });

        expect(reliableMock).toHaveBeenCalledOnce();
        stop();
    });

    it("keeps ticking when a flush throws", () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const stop = startPositionTicker(100);
        flushAllMock.mockImplementation(() => {
            throw new Error("boom");
        });

        expect(() => vi.advanceTimersByTime(300)).not.toThrow();
        expect(errorSpy).toHaveBeenCalledTimes(3);
        errorSpy.mockRestore();
        stop();
    });
});
