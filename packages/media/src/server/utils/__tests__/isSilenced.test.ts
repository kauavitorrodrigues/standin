import { describe, expect, it } from "vitest";
import { isSilenced } from "../isSilenced";

describe("isSilenced", () => {
    it("treats a muted person as silent", () => {
        expect(isSilenced({ muted: true, soundboardActive: false })).toBe(true);
    });

    it("hears a muted person while a clip plays", () => {
        expect(isSilenced({ muted: true, soundboardActive: true })).toBe(false);
    });

    it("never silences a person who is not muted", () => {
        expect(isSilenced({ muted: false, soundboardActive: false })).toBe(
            false
        );
    });
});
