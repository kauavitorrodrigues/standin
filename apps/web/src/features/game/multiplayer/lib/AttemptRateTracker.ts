import {
    ATTEMPT_RATE_MAX_ATTEMPTS,
    ATTEMPT_RATE_WINDOW_MS,
} from "../consts/connection";

// Counts attempts inside a sliding window. Each attempt is forgotten
// ATTEMPT_RATE_WINDOW_MS after it was recorded. The give-up threshold is ours.
export class AttemptRateTracker {
    attemptsInWindow = 0;

    private timers = new Set<ReturnType<typeof setTimeout>>();

    recordAttempt = (): void => {
        this.attemptsInWindow += 1;
        const timer = setTimeout(() => {
            this.timers.delete(timer);
            this.attemptsInWindow -= 1;
        }, ATTEMPT_RATE_WINDOW_MS);
        this.timers.add(timer);
    };

    shouldGiveUp = (): boolean =>
        this.attemptsInWindow >= ATTEMPT_RATE_MAX_ATTEMPTS;

    dispose = (): void => {
        this.timers.forEach(clearTimeout);
        this.timers.clear();
        this.attemptsInWindow = 0;
    };
}
