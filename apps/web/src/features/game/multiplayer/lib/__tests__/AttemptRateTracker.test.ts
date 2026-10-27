import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AttemptRateTracker } from "../AttemptRateTracker";
import {
    ATTEMPT_RATE_MAX_ATTEMPTS,
    ATTEMPT_RATE_WINDOW_MS,
} from "../../consts/connection";

describe("AttemptRateTracker", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("counts attempts and forgets each one after 30 s", () => {
        const tracker = new AttemptRateTracker();

        tracker.recordAttempt();
        vi.advanceTimersByTime(10000);
        tracker.recordAttempt();
        expect(tracker.attemptsInWindow).toBe(2);

        vi.advanceTimersByTime(ATTEMPT_RATE_WINDOW_MS - 10000);
        expect(tracker.attemptsInWindow).toBe(1);

        vi.advanceTimersByTime(10000);
        expect(tracker.attemptsInWindow).toBe(0);
    });

    it("asks to give up at the threshold and recovers once the window slides", () => {
        const tracker = new AttemptRateTracker();

        for (let i = 0; i < ATTEMPT_RATE_MAX_ATTEMPTS - 1; i++) {
            tracker.recordAttempt();
        }
        expect(tracker.shouldGiveUp()).toBe(false);

        tracker.recordAttempt();
        expect(tracker.shouldGiveUp()).toBe(true);

        vi.advanceTimersByTime(ATTEMPT_RATE_WINDOW_MS);
        expect(tracker.shouldGiveUp()).toBe(false);
    });

    it("dispose clears pending timers", () => {
        const tracker = new AttemptRateTracker();

        tracker.recordAttempt();
        tracker.dispose();

        expect(tracker.attemptsInWindow).toBe(0);
        expect(vi.getTimerCount()).toBe(0);
    });
});
