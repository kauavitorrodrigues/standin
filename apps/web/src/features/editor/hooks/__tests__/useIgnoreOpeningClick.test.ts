import { afterEach, describe, expect, it } from "vitest";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useIgnoreOpeningClick } from "../useIgnoreOpeningClick";

const click = () => new Event("click");

describe("useIgnoreOpeningClick", () => {
    afterEach(() => {
        unmountAllHooks();
    });

    it("ignores the click that follows the gesture that opened it", () => {
        const { result } = renderHook(() => useIgnoreOpeningClick(true));

        expect(result.current(click())).toBe(true);
    });

    it("honors a click once a new pointerdown landed while open", () => {
        const { result } = renderHook(() => useIgnoreOpeningClick(true));

        document.dispatchEvent(new Event("pointerdown"));

        expect(result.current(click())).toBe(false);
    });

    it("never ignores anything but a click", () => {
        const { result } = renderHook(() => useIgnoreOpeningClick(true));

        expect(result.current(new Event("keydown"))).toBe(false);
        expect(result.current(undefined)).toBe(false);
    });

    it("keeps ignoring when the pointerdown came before it opened", () => {
        document.dispatchEvent(new Event("pointerdown"));
        const { result } = renderHook(() => useIgnoreOpeningClick(true));

        expect(result.current(click())).toBe(true);
    });
});
