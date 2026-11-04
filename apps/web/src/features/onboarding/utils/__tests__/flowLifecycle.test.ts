import { describe, expect, it, vi } from "vitest";
import { createFlowLifecycle } from "../flowLifecycle";

describe("createFlowLifecycle", () => {
    it("calls onEnd once when the flow ends", () => {
        const onEnd = vi.fn();
        const lifecycle = createFlowLifecycle();
        lifecycle.begin({ onEnd });
        lifecycle.end(false);
        lifecycle.end(false);
        expect(onEnd).toHaveBeenCalledTimes(1);
        expect(onEnd).toHaveBeenCalledWith({ isUnmounting: false });
    });

    it("ends the flow before when another begins", () => {
        const first = vi.fn();
        const second = vi.fn();
        const lifecycle = createFlowLifecycle();
        lifecycle.begin({ onEnd: first });
        lifecycle.begin({ onEnd: second });
        expect(first).toHaveBeenCalledWith({ isUnmounting: false });
        expect(second).not.toHaveBeenCalled();
    });

    it("tells when the screen went away", () => {
        const onEnd = vi.fn();
        const lifecycle = createFlowLifecycle();
        lifecycle.begin({ onEnd });
        lifecycle.end(true);
        expect(onEnd).toHaveBeenCalledWith({ isUnmounting: true });
    });

    it("accepts a flow without onEnd", () => {
        const lifecycle = createFlowLifecycle();
        lifecycle.begin();
        expect(() => lifecycle.end(false)).not.toThrow();
    });
});
