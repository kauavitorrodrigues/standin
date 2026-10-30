import { afterEach, describe, expect, it } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { CONTROLS_VIEWS } from "@/features/spaces/consts/controls-view";
import { useControlsView } from "@/features/spaces/hooks/useControlsView";
import { useUserStatusPanel } from "@/features/spaces/hooks/useUserStatusPanel";
import { useSoundboardPanel } from "../useSoundboardPanel";

const mount = (enabled = true) =>
    renderHook(() => {
        const controls = useControlsView();
        return {
            controls,
            soundboard: useSoundboardPanel({ controls, enabled }),
            status: useUserStatusPanel({ controls }),
        };
    });

describe("useSoundboardPanel", () => {
    afterEach(() => unmountAllHooks());

    it("starts closed", () => {
        const { result } = mount();

        expect(result.current.soundboard.isOpen).toBe(false);
    });

    it("opens and closes with the toggle", () => {
        const { result, act } = mount();

        act(() => result.current.soundboard.onToggle());
        expect(result.current.soundboard.isOpen).toBe(true);
        expect(result.current.controls.view).toBe(CONTROLS_VIEWS.SOUNDBOARD);

        act(() => result.current.soundboard.onToggle());
        expect(result.current.soundboard.isOpen).toBe(false);
        expect(result.current.controls.view).toBe(CONTROLS_VIEWS.NONE);
    });

    it("closes when another view of the bar opens", () => {
        const { result, act } = mount();
        act(() => result.current.soundboard.onToggle());

        act(() => result.current.status.onToggle());

        expect(result.current.soundboard.isOpen).toBe(false);
        expect(result.current.status.isOpen).toBe(true);
    });

    it("closes the other view when it opens", () => {
        const { result, act } = mount();
        act(() => result.current.status.onToggle());

        act(() => result.current.soundboard.onToggle());

        expect(result.current.status.isOpen).toBe(false);
        expect(result.current.soundboard.isOpen).toBe(true);
    });

    it("closes for the reactions and the nearby panel too", () => {
        const { result, act } = mount();

        act(() => result.current.soundboard.onToggle());
        act(() => result.current.controls.toggle(CONTROLS_VIEWS.REACTIONS));
        expect(result.current.soundboard.isOpen).toBe(false);

        act(() => result.current.soundboard.onToggle());
        act(() => result.current.controls.toggle(CONTROLS_VIEWS.NEARBY));
        expect(result.current.soundboard.isOpen).toBe(false);
    });

    it("never reads as open where it is not enabled", () => {
        const { result, act } = mount(false);

        act(() => result.current.soundboard.onToggle());

        expect(result.current.soundboard.isOpen).toBe(false);
    });
});
