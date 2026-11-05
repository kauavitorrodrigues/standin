import { describe, expect, it } from "vitest";
import { isDanceKeyDown, isDanceKeyUp } from "../isDanceKeyDown";

const key = (
    overrides: Partial<Parameters<typeof isDanceKeyDown>[0]> = {}
) => ({
    code: "KeyZ",
    repeat: false,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...overrides,
});

describe("isDanceKeyDown", () => {
    it("starts on the dance key on its own", () => {
        expect(isDanceKeyDown(key())).toBe(true);
    });

    it("ignores the repeat of a held key", () => {
        expect(isDanceKeyDown(key({ repeat: true }))).toBe(false);
    });

    it.each(["shiftKey", "ctrlKey", "metaKey", "altKey"] as const)(
        "ignores the key with %s down",
        (modifier) => {
            expect(isDanceKeyDown(key({ [modifier]: true }))).toBe(false);
        }
    );

    it("ignores other keys", () => {
        expect(isDanceKeyDown(key({ code: "KeyX" }))).toBe(false);
    });
});

describe("isDanceKeyUp", () => {
    it("ends on the release of the dance key only", () => {
        expect(isDanceKeyUp({ code: "KeyZ" })).toBe(true);
        expect(isDanceKeyUp({ code: "KeyX" })).toBe(false);
    });
});
