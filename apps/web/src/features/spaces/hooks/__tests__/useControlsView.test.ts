import { afterEach, describe, expect, it } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { CONTROLS_VIEWS } from "@/features/spaces/consts/controls-view";
import { useControlsView } from "../useControlsView";

describe("useControlsView", () => {
    afterEach(() => unmountAllHooks());

    it("starts with nothing open", () => {
        const { result } = renderHook(useControlsView);

        expect(result.current.view).toBe(CONTROLS_VIEWS.NONE);
    });

    it("opening the nearby panel closes the reactions and the other way", () => {
        const { result, act } = renderHook(useControlsView);

        act(() => result.current.toggle(CONTROLS_VIEWS.REACTIONS));
        expect(result.current.view).toBe(CONTROLS_VIEWS.REACTIONS);

        act(() => result.current.toggle(CONTROLS_VIEWS.NEARBY));
        expect(result.current.view).toBe(CONTROLS_VIEWS.NEARBY);

        act(() => result.current.toggle(CONTROLS_VIEWS.REACTIONS));
        expect(result.current.view).toBe(CONTROLS_VIEWS.REACTIONS);
    });

    it("toggling the open view closes it", () => {
        const { result, act } = renderHook(useControlsView);

        act(() => result.current.toggle(CONTROLS_VIEWS.NEARBY));
        act(() => result.current.toggle(CONTROLS_VIEWS.NEARBY));

        expect(result.current.view).toBe(CONTROLS_VIEWS.NONE);
    });

    it("closing a view does not close another one that took its place", () => {
        const { result, act } = renderHook(useControlsView);

        act(() => result.current.open(CONTROLS_VIEWS.REACTIONS));
        act(() => result.current.close(CONTROLS_VIEWS.NEARBY));

        expect(result.current.view).toBe(CONTROLS_VIEWS.REACTIONS);
    });
});
