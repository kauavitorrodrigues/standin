import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { expireDueMock } = vi.hoisted(() => ({ expireDueMock: vi.fn() }));

vi.mock("@standin/core", () => ({
    SpaceGuestService: { expireDue: expireDueMock },
}));

import { startGuestSweeper } from "../startGuestSweeper";

describe("startGuestSweeper", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        expireDueMock.mockResolvedValue([]);
    });
    afterEach(() => vi.useRealTimers());

    it("expires the lapsed guests on every tick", async () => {
        const stop = startGuestSweeper(1000);

        await vi.advanceTimersByTimeAsync(3000);

        expect(expireDueMock).toHaveBeenCalledTimes(3);
        stop();
    });

    it("keeps sweeping after a failure, and logs it", async () => {
        const logged = vi.spyOn(console, "error").mockImplementation(() => {});
        expireDueMock.mockRejectedValueOnce(new Error("db down"));
        const stop = startGuestSweeper(1000);

        await vi.advanceTimersByTimeAsync(2000);

        expect(expireDueMock).toHaveBeenCalledTimes(2);
        expect(logged).toHaveBeenCalledTimes(1);
        stop();
        logged.mockRestore();
    });

    it("stops when asked", async () => {
        const stop = startGuestSweeper(1000);
        stop();

        await vi.advanceTimersByTimeAsync(5000);

        expect(expireDueMock).not.toHaveBeenCalled();
    });
});
