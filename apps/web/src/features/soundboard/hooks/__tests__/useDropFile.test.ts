import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useDropFile } from "../useDropFile";

const dropEvent = (files: File[]) => ({
    preventDefault: vi.fn(),
    dataTransfer: { files },
});

describe("useDropFile", () => {
    afterEach(() => unmountAllHooks());

    it("marks the area while a file is dragged over it and clears on leave", () => {
        const { result, act } = renderHook(() =>
            useDropFile({ onDrop: vi.fn(), disabled: false })
        );

        act(() => result.current.handlers.onDragOver(dropEvent([])));
        expect(result.current.isOver).toBe(true);

        act(() => result.current.handlers.onDragLeave());
        expect(result.current.isOver).toBe(false);
    });

    it("hands over the first file dropped and clears the mark", () => {
        const onDrop = vi.fn();
        const { result, act } = renderHook(() =>
            useDropFile({ onDrop, disabled: false })
        );
        const first = new File(["a"], "a.mp3");
        const second = new File(["b"], "b.mp3");

        act(() => result.current.handlers.onDragOver(dropEvent([])));
        act(() => result.current.handlers.onDrop(dropEvent([first, second])));

        expect(onDrop).toHaveBeenCalledExactlyOnceWith(first);
        expect(result.current.isOver).toBe(false);
    });

    it("ignores everything while disabled", () => {
        const onDrop = vi.fn();
        const { result, act } = renderHook(() =>
            useDropFile({ onDrop, disabled: true })
        );

        act(() => result.current.handlers.onDragOver(dropEvent([])));
        act(() =>
            result.current.handlers.onDrop(
                dropEvent([new File(["a"], "a.mp3")])
            )
        );

        expect(result.current.isOver).toBe(false);
        expect(onDrop).not.toHaveBeenCalled();
    });
});
