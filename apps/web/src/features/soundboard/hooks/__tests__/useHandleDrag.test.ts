import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { SOUNDBOARD_HANDLE_STEP_MS } from "../../consts/trim";
import { useHandleDrag } from "../useHandleDrag";

const RANGE = { startMs: 1000, endMs: 4000 };

const key = (name: string, shiftKey = false) => {
    const preventDefault = vi.fn();
    return { event: { key: name, shiftKey, preventDefault }, preventDefault };
};

describe("useHandleDrag keyboard", () => {
    afterEach(() => unmountAllHooks());

    it("moves the start handle with the arrow keys", () => {
        const onChange = vi.fn();
        const { result } = renderHook(() =>
            useHandleDrag({ durationMs: 5000, range: RANGE, onChange })
        );
        const { event, preventDefault } = key("ArrowRight");

        result.current.nudge("startMs", event);

        expect(onChange).toHaveBeenCalledWith({
            startMs: 1000 + SOUNDBOARD_HANDLE_STEP_MS,
            endMs: 4000,
        });
        expect(preventDefault).toHaveBeenCalled();
    });

    it("moves the end handle back", () => {
        const onChange = vi.fn();
        const { result } = renderHook(() =>
            useHandleDrag({ durationMs: 5000, range: RANGE, onChange })
        );

        result.current.nudge("endMs", key("ArrowLeft").event);

        expect(onChange).toHaveBeenCalledWith({
            startMs: 1000,
            endMs: 4000 - SOUNDBOARD_HANDLE_STEP_MS,
        });
    });

    it("leaves other keys alone", () => {
        const onChange = vi.fn();
        const { result } = renderHook(() =>
            useHandleDrag({ durationMs: 5000, range: RANGE, onChange })
        );
        const { event, preventDefault } = key("Tab");

        result.current.nudge("startMs", event);

        expect(onChange).not.toHaveBeenCalled();
        expect(preventDefault).not.toHaveBeenCalled();
    });
});
