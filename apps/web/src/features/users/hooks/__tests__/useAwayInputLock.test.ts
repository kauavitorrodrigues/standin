// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { isGameInputLocked } from "@/features/game/utils/inputLock";
import { renderHook, unmountAllHooks } from "@/test-utils/renderHook";
import { useAwayInputLock } from "../useAwayInputLock";

afterEach(unmountAllHooks);

describe("useAwayInputLock", () => {
    it("leaves the game alone while the person is in the office", () => {
        renderHook(() => useAwayInputLock(false));

        expect(isGameInputLocked()).toBe(false);
    });

    it("holds the keyboard of the game while away", () => {
        renderHook(() => useAwayInputLock(true));

        expect(isGameInputLocked()).toBe(true);
    });

    it("lets go when the person returns", () => {
        let setAway: (isAway: boolean) => void = () => undefined;
        const view = renderHook(() => {
            const [isAway, set] = useState(true);
            setAway = set;
            useAwayInputLock(isAway);
        });
        expect(isGameInputLocked()).toBe(true);

        view.act(() => setAway(false));

        expect(isGameInputLocked()).toBe(false);
    });

    it("lets go on unmount", () => {
        const view = renderHook(() => useAwayInputLock(true));

        view.unmount();

        expect(isGameInputLocked()).toBe(false);
    });
});
