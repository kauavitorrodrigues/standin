import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useElementWidth } from "../useElementWidth";

type Callback = (entries: { contentRect: { width: number } }[]) => void;

describe("useElementWidth", () => {
    let callback: Callback | null = null;
    const disconnect = vi.fn();

    beforeEach(() => {
        callback = null;
        disconnect.mockClear();
        vi.stubGlobal(
            "ResizeObserver",
            class {
                constructor(listener: Callback) {
                    callback = listener;
                }
                observe = vi.fn();
                disconnect = disconnect;
            }
        );
    });

    afterEach(() => {
        unmountAllHooks();
        vi.unstubAllGlobals();
    });

    it("is zero until the element is measured", () => {
        const { result } = renderHook(() =>
            useElementWidth(document.createElement("div"))
        );

        expect(result.current).toBe(0);
    });

    it("follows the width the observer reports", () => {
        const element = document.createElement("div");
        const { result } = renderHook(() => useElementWidth(element));

        act(() => callback?.([{ contentRect: { width: 360 } }]));

        expect(result.current).toBe(360);
    });

    it("does not observe without an element", () => {
        renderHook(() => useElementWidth(null));

        expect(callback).toBeNull();
    });

    it("stops observing when it unmounts", () => {
        const { unmount } = renderHook(() =>
            useElementWidth(document.createElement("div"))
        );

        unmount();

        expect(disconnect).toHaveBeenCalled();
    });
});
