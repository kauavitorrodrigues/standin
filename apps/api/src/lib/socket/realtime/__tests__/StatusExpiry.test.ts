import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StatusExpiry } from "../StatusExpiry";

describe("StatusExpiry", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1_000_000);
        StatusExpiry.clear();
    });

    afterEach(() => {
        StatusExpiry.clear();
        vi.useRealTimers();
    });

    it("runs the callback when the time is up, and not before", () => {
        const onExpire = vi.fn();
        StatusExpiry.schedule("s1", 1_000_000 + 60_000, onExpire);

        vi.advanceTimersByTime(59_999);
        expect(onExpire).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(onExpire).toHaveBeenCalledTimes(1);
        expect(StatusExpiry.size()).toBe(0);
    });

    it("runs right away for an end that already passed", () => {
        const onExpire = vi.fn();
        StatusExpiry.schedule("s1", 1_000_000 - 5, onExpire);

        vi.advanceTimersByTime(0);

        expect(onExpire).toHaveBeenCalledTimes(1);
    });

    it("replaces the timer of the same connection", () => {
        const first = vi.fn();
        const second = vi.fn();
        StatusExpiry.schedule("s1", 1_000_000 + 1000, first);
        StatusExpiry.schedule("s1", 1_000_000 + 2000, second);

        vi.advanceTimersByTime(5000);

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it("has no timer for a status that does not end", () => {
        const onExpire = vi.fn();
        StatusExpiry.schedule("s1", 1_000_000 + 1000, onExpire);
        StatusExpiry.schedule("s1", null, onExpire);

        vi.advanceTimersByTime(10_000);

        expect(onExpire).not.toHaveBeenCalled();
        expect(StatusExpiry.size()).toBe(0);
    });

    it("cancels the timer of a connection that left", () => {
        const onExpire = vi.fn();
        StatusExpiry.schedule("s1", 1_000_000 + 1000, onExpire);
        StatusExpiry.cancel("s1");
        StatusExpiry.cancel("nobody");

        vi.advanceTimersByTime(10_000);

        expect(onExpire).not.toHaveBeenCalled();
        expect(StatusExpiry.size()).toBe(0);
    });
});
