import { describe, expect, it } from "vitest";
import { resolveScreenTier } from "../resolveScreenTier";

describe("resolveScreenTier", () => {
    it("keeps every tier when HD is allowed", () => {
        expect(resolveScreenTier("LOW", true)).toBe("LOW");
        expect(resolveScreenTier("MED", true)).toBe("MED");
        expect(resolveScreenTier("HIGH", true)).toBe("HIGH");
    });

    it("cuts HIGH to MED when HD is off", () => {
        expect(resolveScreenTier("HIGH", false)).toBe("MED");
    });

    it("keeps LOW and MED when HD is off", () => {
        expect(resolveScreenTier("LOW", false)).toBe("LOW");
        expect(resolveScreenTier("MED", false)).toBe("MED");
    });
});
