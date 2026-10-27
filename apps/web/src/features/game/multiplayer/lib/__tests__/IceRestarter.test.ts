import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IceRestarter } from "../IceRestarter";

const setup = (overrides: Record<string, unknown> = {}) => {
    const requestIceParameters = vi.fn(async () => ({ usernameFragment: "u" }));
    const restartIce = vi.fn(async () => undefined);
    const setReason = vi.fn();
    const onBroken = vi.fn();
    const restarter = new IceRestarter({
        requestIceParameters,
        restartIce,
        setReason,
        onBroken,
        delay: (attempt) => 100 * 2 ** attempt,
        maxAttempts: 3,
        connectTimeoutMs: 1000,
        ...overrides,
    });
    return { restarter, requestIceParameters, restartIce, setReason, onBroken };
};

describe("IceRestarter", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("recovers on the first try without breaking the session", async () => {
        const { restarter, restartIce, setReason, onBroken } = setup();
        restarter.trigger();
        await vi.advanceTimersByTimeAsync(100);
        restarter.notifyConnected();
        await vi.advanceTimersByTimeAsync(0);

        expect(setReason).toHaveBeenCalledWith("iceRestart");
        expect(restartIce).toHaveBeenCalledWith({ usernameFragment: "u" });
        expect(restartIce).toHaveBeenCalledTimes(1);
        expect(onBroken).not.toHaveBeenCalled();
    });

    it("retries with a growing delay until the transport connects", async () => {
        const { restarter, restartIce, onBroken } = setup();
        restarter.trigger();
        await vi.advanceTimersByTimeAsync(100);
        expect(restartIce).toHaveBeenCalledTimes(1);

        // The first attempt times out, then waits 200 ms before the next.
        await vi.advanceTimersByTimeAsync(1000);
        expect(restartIce).toHaveBeenCalledTimes(1);
        await vi.advanceTimersByTimeAsync(200);
        expect(restartIce).toHaveBeenCalledTimes(2);

        restarter.notifyConnected();
        await vi.advanceTimersByTimeAsync(5000);
        expect(restartIce).toHaveBeenCalledTimes(2);
        expect(onBroken).not.toHaveBeenCalled();
    });

    it("reports a broken session once the attempts run out", async () => {
        const { restarter, restartIce, onBroken } = setup();
        restarter.trigger();
        restarter.trigger();
        await vi.advanceTimersByTimeAsync(10000);

        expect(restartIce).toHaveBeenCalledTimes(3);
        expect(onBroken).toHaveBeenCalledTimes(1);
    });

    it("reports a broken session at once when the server refuses", async () => {
        const { restarter, restartIce, onBroken } = setup({
            requestIceParameters: vi.fn(async () => {
                throw new Error("refused");
            }),
        });
        restarter.trigger();
        await vi.advanceTimersByTimeAsync(100);

        expect(restartIce).not.toHaveBeenCalled();
        expect(onBroken).toHaveBeenCalledTimes(1);
    });

    it("stops when closed", async () => {
        const { restarter, requestIceParameters, onBroken } = setup();
        restarter.trigger();
        restarter.close();
        await vi.advanceTimersByTimeAsync(10000);

        expect(requestIceParameters).not.toHaveBeenCalled();
        expect(onBroken).not.toHaveBeenCalled();
        restarter.trigger();
        await vi.advanceTimersByTimeAsync(10000);
        expect(requestIceParameters).not.toHaveBeenCalled();
    });
});
