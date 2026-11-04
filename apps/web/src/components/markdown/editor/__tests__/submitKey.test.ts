import { describe, expect, it } from "vitest";
import { shouldSubmit } from "../consts/submitKey";

const press = (key: string, shiftKey = false, isComposing = false) =>
    shouldSubmit({ key, shiftKey, isComposing });

describe("shouldSubmit", () => {
    it("sends on Enter", () => {
        expect(press("Enter")).toBe(true);
    });

    it("breaks the line on Shift+Enter", () => {
        expect(press("Enter", true)).toBe(false);
    });

    it("confirms the candidate during an IME composition", () => {
        expect(press("Enter", false, true)).toBe(false);
    });

    it("ignores other keys", () => {
        expect(press("a")).toBe(false);
    });
});
