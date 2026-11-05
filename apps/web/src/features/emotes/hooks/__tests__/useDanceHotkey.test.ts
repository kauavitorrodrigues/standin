// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { acquireGameInputLock } from "@/features/game/utils/inputLock";
import { useDanceHotkey } from "../useDanceHotkey";

const press = (type: "keydown" | "keyup", init: KeyboardEventInit = {}) =>
    window.dispatchEvent(
        new KeyboardEvent(type, { code: "KeyZ", cancelable: true, ...init })
    );

describe("useDanceHotkey", () => {
    afterEach(() => unmountAllHooks());

    it("dances while the key is held and stops on release", () => {
        const onDance = vi.fn();
        renderHook(() => useDanceHotkey(onDance));

        press("keydown");
        expect(onDance).toHaveBeenLastCalledWith(true);

        press("keyup");
        expect(onDance).toHaveBeenLastCalledWith(false);
    });

    it("ignores the repeat of the held key and the keys with a modifier", () => {
        const onDance = vi.fn();
        renderHook(() => useDanceHotkey(onDance));

        press("keydown", { repeat: true });
        press("keydown", { shiftKey: true });
        press("keydown", { ctrlKey: true });

        expect(onDance).not.toHaveBeenCalled();
    });

    it("does not start while an overlay holds the game input", () => {
        const onDance = vi.fn();
        renderHook(() => useDanceHotkey(onDance));
        const release = acquireGameInputLock();

        press("keydown");
        release();

        expect(onDance).not.toHaveBeenCalled();
    });

    it("does not start while typing in a field", () => {
        const onDance = vi.fn();
        renderHook(() => useDanceHotkey(onDance));
        const input = document.createElement("input");
        document.body.append(input);

        input.dispatchEvent(
            new KeyboardEvent("keydown", {
                code: "KeyZ",
                bubbles: true,
                cancelable: true,
            })
        );
        input.remove();

        expect(onDance).not.toHaveBeenCalled();
    });

    it("stops when the window loses focus", () => {
        const onDance = vi.fn();
        renderHook(() => useDanceHotkey(onDance));

        press("keydown");
        window.dispatchEvent(new Event("blur"));

        expect(onDance).toHaveBeenLastCalledWith(false);
    });

    it("stops when the tab is hidden", () => {
        const onDance = vi.fn();
        renderHook(() => useDanceHotkey(onDance));
        press("keydown");

        Object.defineProperty(document, "hidden", {
            configurable: true,
            get: () => true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
        Object.defineProperty(document, "hidden", {
            configurable: true,
            get: () => false,
        });

        expect(onDance).toHaveBeenLastCalledWith(false);
    });

    it("stops when it is turned off or unmounted", () => {
        const onDance = vi.fn();
        renderHook(() => useDanceHotkey(onDance));
        press("keydown");

        unmountAllHooks();

        expect(onDance).toHaveBeenLastCalledWith(false);
    });

    it("does nothing when off", () => {
        const onDance = vi.fn();
        renderHook(() => useDanceHotkey(onDance, { enabled: false }));

        press("keydown");

        expect(onDance).not.toHaveBeenCalled();
    });
});
