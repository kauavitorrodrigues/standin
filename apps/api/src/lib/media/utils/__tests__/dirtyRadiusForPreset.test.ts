import { describe, expect, it } from "vitest";
import { dirtyRadiusForPreset } from "../dirtyRadiusForPreset";

describe("dirtyRadiusForPreset", () => {
    it("covers the exit radius of Long", () => {
        expect(dirtyRadiusForPreset("Long")).toBe(414);
    });

    it("covers the exit radius of Short", () => {
        expect(dirtyRadiusForPreset("Short")).toBe(190);
    });

    it("reaches the outer exit radius of the ambient ring", () => {
        // Short ring: 5 + 4 tiles, Long ring: 12 + 10 tiles, plus the margin.
        expect(dirtyRadiusForPreset("Short", "short")).toBe(318);
        expect(dirtyRadiusForPreset("Long", "long")).toBe(734);
    });

    it("ignores a range that is off", () => {
        expect(dirtyRadiusForPreset("Short", "off")).toBe(190);
    });
});
