import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHoverDwell } from "../createHoverDwell";

describe("createHoverDwell", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("fires once the mouse has rested for the delay", () => {
        const onDwell = vi.fn();
        const dwell = createHoverDwell(150, onDwell);

        dwell.hover("a");
        vi.advanceTimersByTime(149);
        expect(onDwell).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(onDwell).toHaveBeenCalledExactlyOnceWith("a");
    });

    it("fires nothing for a mouse that passes over", () => {
        const onDwell = vi.fn();
        const dwell = createHoverDwell(150, onDwell);

        dwell.hover("a");
        vi.advanceTimersByTime(100);
        dwell.hover(null);
        vi.advanceTimersByTime(500);

        expect(onDwell).not.toHaveBeenCalled();
    });

    it("starts over on another target", () => {
        const onDwell = vi.fn();
        const dwell = createHoverDwell(150, onDwell);

        dwell.hover("a");
        vi.advanceTimersByTime(100);
        dwell.hover("b");
        vi.advanceTimersByTime(100);
        expect(onDwell).not.toHaveBeenCalled();

        vi.advanceTimersByTime(50);
        expect(onDwell).toHaveBeenCalledExactlyOnceWith("b");
    });

    it("does not restart when the same target is told again", () => {
        const onDwell = vi.fn();
        const dwell = createHoverDwell(150, onDwell);

        dwell.hover("a");
        vi.advanceTimersByTime(100);
        dwell.hover("a");
        vi.advanceTimersByTime(50);

        expect(onDwell).toHaveBeenCalledExactlyOnceWith("a");
    });

    it("does not fire again for a target that already fired", () => {
        const onDwell = vi.fn();
        const dwell = createHoverDwell(150, onDwell);

        dwell.hover("a");
        vi.advanceTimersByTime(150);
        dwell.hover("a");
        vi.advanceTimersByTime(500);

        expect(onDwell).toHaveBeenCalledTimes(1);
    });

    it("fires again after leaving and coming back", () => {
        const onDwell = vi.fn();
        const dwell = createHoverDwell(150, onDwell);

        dwell.hover("a");
        vi.advanceTimersByTime(150);
        dwell.hover(null);
        dwell.hover("a");
        vi.advanceTimersByTime(150);

        expect(onDwell).toHaveBeenCalledTimes(2);
    });

    it("cancel drops a pending fire", () => {
        const onDwell = vi.fn();
        const dwell = createHoverDwell(150, onDwell);

        dwell.hover("a");
        dwell.cancel();
        vi.advanceTimersByTime(500);

        expect(onDwell).not.toHaveBeenCalled();
    });
});
