import { afterEach, describe, expect, it } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import {
    acquireGameInputLock,
    isGameInputLocked,
} from "@/features/game/utils/inputLock";
import { CONTROLS_VIEWS } from "@/features/spaces/consts/controls-view";
import { useControlsView } from "@/features/spaces/hooks/useControlsView";
import { useNearbyChat } from "../useNearbyChat";

const useSubject = (enabled = true) => {
    const controls = useControlsView();
    const nearby = useNearbyChat({ enabled, controls });
    return { controls, nearby };
};

const press = (key: string, target: EventTarget = window) =>
    target.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })
    );

const pressMouse = (target: EventTarget) =>
    target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

describe("useNearbyChat", () => {
    afterEach(() => {
        unmountAllHooks();
        document.body.innerHTML = "";
    });

    it("opens and closes with the slash key", () => {
        const { result, act } = renderHook(() => useSubject());

        act(() => void press("/"));
        expect(result.current.nearby.isOpen).toBe(true);

        act(() => void press("/"));
        expect(result.current.nearby.isOpen).toBe(false);
    });

    it("leaves the slash key alone when the space turned the chat off", () => {
        const { result, act } = renderHook(() => useSubject(false));

        act(() => void press("/"));

        expect(result.current.nearby.isOpen).toBe(false);
    });

    it("does not open while the person types somewhere", () => {
        const input = document.createElement("input");
        document.body.append(input);
        const { result, act } = renderHook(() => useSubject());

        act(() => void press("/", input));

        expect(result.current.nearby.isOpen).toBe(false);
    });

    it("does not open while another overlay holds the game input", () => {
        const release = acquireGameInputLock();
        const { result, act } = renderHook(() => useSubject());

        act(() => void press("/"));
        expect(result.current.nearby.isOpen).toBe(false);

        release();
    });

    it("does nothing where it is not enabled", () => {
        const { result, act } = renderHook(() => useSubject(false));

        act(() => void press("/"));

        expect(result.current.controls.view).toBe(CONTROLS_VIEWS.NONE);
    });

    it("holds the game input while open and lets it go on close", () => {
        const { result, act } = renderHook(() => useSubject());

        act(() => result.current.nearby.open());
        expect(isGameInputLocked()).toBe(true);

        act(() => result.current.nearby.close());
        expect(isGameInputLocked()).toBe(false);
    });

    it("lets the game input go when unmounted while open", () => {
        const { result, act, unmount } = renderHook(() => useSubject());

        act(() => result.current.nearby.open());
        unmount();

        expect(isGameInputLocked()).toBe(false);
    });

    it("closes with Escape", () => {
        const { result, act } = renderHook(() => useSubject());
        act(() => result.current.nearby.open());

        act(() => void press("Escape"));

        expect(result.current.nearby.isOpen).toBe(false);
    });

    it("closes with a press outside and stays open for one inside", () => {
        const inside = document.createElement("div");
        inside.setAttribute("data-nearby-chat", "");
        const outside = document.createElement("div");
        document.body.append(inside, outside);
        const { result, act } = renderHook(() => useSubject());
        act(() => result.current.nearby.open());

        act(() => void pressMouse(inside));
        expect(result.current.nearby.isOpen).toBe(true);

        act(() => void pressMouse(outside));
        expect(result.current.nearby.isOpen).toBe(false);
    });

    it("stays open for a press on a tooltip", () => {
        const tooltip = document.createElement("div");
        tooltip.setAttribute("data-slot", "tooltip-content");
        document.body.append(tooltip);
        const { result, act } = renderHook(() => useSubject());
        act(() => result.current.nearby.open());

        act(() => void pressMouse(tooltip));

        expect(result.current.nearby.isOpen).toBe(true);
    });

    it("opening the reactions closes the panel", () => {
        const { result, act } = renderHook(() => useSubject());
        act(() => result.current.nearby.open());

        act(() => result.current.controls.open(CONTROLS_VIEWS.REACTIONS));

        expect(result.current.nearby.isOpen).toBe(false);
    });
});
