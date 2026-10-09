import { describe, expect, it } from "vitest";
import { getModShortcutKeys } from "../getModShortcutKeys";

describe("getModShortcutKeys", () => {
    it("uses Cmd on Apple platforms", () => {
        expect(getModShortcutKeys("F", "MacIntel")).toEqual(["⌘", "F"]);
    });

    it("uses Ctrl elsewhere", () => {
        expect(getModShortcutKeys("F", "Linux x86_64")).toEqual(["Ctrl", "F"]);
    });
});
