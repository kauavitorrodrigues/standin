import { describe, expect, it } from "vitest";
import {
    SOUNDBOARD_HANDLE_BIG_STEP_MS,
    SOUNDBOARD_HANDLE_STEP_MS,
} from "../../consts/trim";
import { getHandleStep } from "../getHandleStep";

describe("getHandleStep", () => {
    it("moves back with left and down", () => {
        expect(getHandleStep("ArrowLeft", false)).toBe(
            -SOUNDBOARD_HANDLE_STEP_MS
        );
        expect(getHandleStep("ArrowDown", false)).toBe(
            -SOUNDBOARD_HANDLE_STEP_MS
        );
    });

    it("moves forward with right and up", () => {
        expect(getHandleStep("ArrowRight", false)).toBe(
            SOUNDBOARD_HANDLE_STEP_MS
        );
        expect(getHandleStep("ArrowUp", false)).toBe(SOUNDBOARD_HANDLE_STEP_MS);
    });

    it("takes a bigger step with shift", () => {
        expect(getHandleStep("ArrowRight", true)).toBe(
            SOUNDBOARD_HANDLE_BIG_STEP_MS
        );
        expect(getHandleStep("ArrowLeft", true)).toBe(
            -SOUNDBOARD_HANDLE_BIG_STEP_MS
        );
    });

    it("ignores any other key", () => {
        expect(getHandleStep("Enter", false)).toBeNull();
        expect(getHandleStep("a", true)).toBeNull();
    });
});
