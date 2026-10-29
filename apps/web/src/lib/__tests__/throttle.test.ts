import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { throttle } from "@/lib/throttle";

describe("throttle", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("runs the first call at once and the last one when the window ends", () => {
        const run = vi.fn();
        const throttled = throttle(run, 2000);

        [1, 2, 3, 4, 5].forEach((value) => throttled(value));
        expect(run).toHaveBeenCalledTimes(1);
        expect(run).toHaveBeenLastCalledWith(1);

        vi.advanceTimersByTime(2000);
        expect(run).toHaveBeenCalledTimes(2);
        expect(run).toHaveBeenLastCalledWith(5);
    });

    it("plays nothing more when no call came during the window", () => {
        const run = vi.fn();
        const throttled = throttle(run, 2000);

        throttled();
        vi.advanceTimersByTime(10_000);
        expect(run).toHaveBeenCalledTimes(1);
    });

    it("runs again at once after a quiet window", () => {
        const run = vi.fn();
        const throttled = throttle(run, 2000);

        throttled();
        vi.advanceTimersByTime(2000);
        throttled();
        expect(run).toHaveBeenCalledTimes(2);
    });

    it("keeps at most two runs inside a window of a burst", () => {
        const run = vi.fn();
        const throttled = throttle(run, 2000);

        for (let i = 0; i < 5; i++) {
            throttled();
            vi.advanceTimersByTime(300);
        }
        vi.advanceTimersByTime(499);
        expect(run).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(1);
        expect(run).toHaveBeenCalledTimes(2);
    });
});
