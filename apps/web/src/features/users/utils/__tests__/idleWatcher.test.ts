import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createIdleWatcher } from "../idleWatcher";
import { resolveUserStatus } from "../userStatus";

const TIMEOUT_MS = 5 * 60 * 1000;
const PULSE_MS = 15 * 1000;

describe("createIdleWatcher", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(0);
    });

    afterEach(() => vi.useRealTimers());

    it("goes idle after the time without activity, and not before", () => {
        const onChange = vi.fn();
        createIdleWatcher({
            timeoutMs: TIMEOUT_MS,
            speechPulseMs: PULSE_MS,
            onChange,
        });

        vi.advanceTimersByTime(TIMEOUT_MS - 1);
        expect(onChange).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
    });

    it("counts the time from the last activity", () => {
        const onChange = vi.fn();
        const watcher = createIdleWatcher({
            timeoutMs: TIMEOUT_MS,
            speechPulseMs: PULSE_MS,
            onChange,
        });

        vi.advanceTimersByTime(TIMEOUT_MS - 1000);
        watcher.activity();
        vi.advanceTimersByTime(TIMEOUT_MS - 1);
        expect(onChange).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
    });

    it("comes back on activity, and goes idle again after another wait", () => {
        const onChange = vi.fn();
        const watcher = createIdleWatcher({
            timeoutMs: TIMEOUT_MS,
            speechPulseMs: PULSE_MS,
            onChange,
        });
        vi.advanceTimersByTime(TIMEOUT_MS);

        watcher.activity();
        expect(onChange).toHaveBeenLastCalledWith(false);

        vi.advanceTimersByTime(TIMEOUT_MS);
        expect(onChange.mock.calls).toEqual([[true], [false], [true]]);
    });

    it("does not repeat itself while the person is active", () => {
        const onChange = vi.fn();
        const watcher = createIdleWatcher({
            timeoutMs: TIMEOUT_MS,
            speechPulseMs: PULSE_MS,
            onChange,
        });

        watcher.activity();
        watcher.activity();

        expect(onChange).not.toHaveBeenCalled();
    });

    it("says nothing after it is stopped", () => {
        const onChange = vi.fn();
        const watcher = createIdleWatcher({
            timeoutMs: TIMEOUT_MS,
            speechPulseMs: PULSE_MS,
            onChange,
        });
        watcher.stop();

        vi.advanceTimersByTime(TIMEOUT_MS * 2);

        expect(onChange).not.toHaveBeenCalled();
    });

    describe("speech", () => {
        it("keeps the person active for as long as they speak", () => {
            const onChange = vi.fn();
            const watcher = createIdleWatcher({
                timeoutMs: TIMEOUT_MS,
                speechPulseMs: PULSE_MS,
                onChange,
            });

            watcher.speaking(true);
            vi.advanceTimersByTime(TIMEOUT_MS * 3);

            expect(onChange).not.toHaveBeenCalled();
        });

        it("goes idle after the full time once the speech stops", () => {
            const onChange = vi.fn();
            const watcher = createIdleWatcher({
                timeoutMs: TIMEOUT_MS,
                speechPulseMs: PULSE_MS,
                onChange,
            });
            watcher.speaking(true);
            vi.advanceTimersByTime(TIMEOUT_MS * 2);

            watcher.speaking(false);
            vi.advanceTimersByTime(TIMEOUT_MS - 1);
            expect(onChange).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
        });

        it("brings the person back when they speak while idle", () => {
            const onChange = vi.fn();
            const watcher = createIdleWatcher({
                timeoutMs: TIMEOUT_MS,
                speechPulseMs: PULSE_MS,
                onChange,
            });
            vi.advanceTimersByTime(TIMEOUT_MS);

            watcher.speaking(true);

            expect(onChange).toHaveBeenLastCalledWith(false);
        });

        it("ignores a stop that never started", () => {
            const onChange = vi.fn();
            const watcher = createIdleWatcher({
                timeoutMs: TIMEOUT_MS,
                speechPulseMs: PULSE_MS,
                onChange,
            });
            vi.advanceTimersByTime(TIMEOUT_MS - 1000);

            watcher.speaking(false);
            vi.advanceTimersByTime(1000);

            expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
        });

        it("stops counting after the watcher is stopped", () => {
            const onChange = vi.fn();
            const watcher = createIdleWatcher({
                timeoutMs: TIMEOUT_MS,
                speechPulseMs: PULSE_MS,
                onChange,
            });
            watcher.speaking(true);
            watcher.stop();

            vi.advanceTimersByTime(TIMEOUT_MS * 2);

            expect(onChange).not.toHaveBeenCalled();
        });

        it("changes nothing for a manual away or busy", () => {
            let isIdle = false;
            const watcher = createIdleWatcher({
                timeoutMs: TIMEOUT_MS,
                speechPulseMs: PULSE_MS,
                onChange: (next) => (isIdle = next),
            });
            watcher.speaking(true);
            vi.advanceTimersByTime(TIMEOUT_MS * 2);

            expect(
                resolveUserStatus({ isBusy: false, isManualAway: true, isIdle })
            ).toBe("away");
            expect(
                resolveUserStatus({ isBusy: true, isManualAway: false, isIdle })
            ).toBe("busy");
            expect(
                resolveUserStatus({
                    isBusy: false,
                    isManualAway: false,
                    isIdle,
                })
            ).toBe("active");
        });
    });
});
