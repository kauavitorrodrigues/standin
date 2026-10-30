import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, useState } from "react";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { SOUNDBOARD_FOLD_DURATION_MS } from "../../consts/fold";
import { useRetainedWhileCollapsing } from "../useRetainedWhileCollapsing";

const useProbe = (initial: boolean) => {
    const [collapsed, setCollapsed] = useState(initial);
    return { setCollapsed, retained: useRetainedWhileCollapsing(collapsed) };
};

describe("useRetainedWhileCollapsing", () => {
    beforeEach(() => vi.useFakeTimers());

    afterEach(() => {
        unmountAllHooks();
        vi.useRealTimers();
    });

    it("keeps an open row", () => {
        const { result } = renderHook(() => useProbe(false));

        expect(result.current.retained).toBe(true);
    });

    it("never draws a row that was folded from the start", () => {
        const { result } = renderHook(() => useProbe(true));
        act(() => vi.advanceTimersByTime(SOUNDBOARD_FOLD_DURATION_MS * 2));

        expect(result.current.retained).toBe(false);
    });

    it("keeps a row that folds for the length of the fold, then lets it go", () => {
        const { result } = renderHook(() => useProbe(false));

        act(() => result.current.setCollapsed(true));
        expect(result.current.retained).toBe(true);

        act(() => vi.advanceTimersByTime(SOUNDBOARD_FOLD_DURATION_MS - 1));
        expect(result.current.retained).toBe(true);

        act(() => vi.advanceTimersByTime(1));
        expect(result.current.retained).toBe(false);
    });

    it("draws a row again the moment it unfolds", () => {
        const { result } = renderHook(() => useProbe(true));

        act(() => result.current.setCollapsed(false));

        expect(result.current.retained).toBe(true);
    });

    it("does not let go of a row that unfolds before the fold ends", () => {
        const { result } = renderHook(() => useProbe(false));
        act(() => result.current.setCollapsed(true));
        act(() => vi.advanceTimersByTime(SOUNDBOARD_FOLD_DURATION_MS / 2));

        act(() => result.current.setCollapsed(false));
        act(() => vi.advanceTimersByTime(SOUNDBOARD_FOLD_DURATION_MS));

        expect(result.current.retained).toBe(true);
    });
});
