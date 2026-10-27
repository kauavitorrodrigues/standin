import { describe, expect, it } from "vitest";
import { dirtyRadiusForPreset } from "../dirtyRadiusForPreset";

describe("dirtyRadiusForPreset", () => {
    it("covers the exit radius of Long", () => {
        expect(dirtyRadiusForPreset("Long")).toBe(414);
    });

    it("covers the exit radius of Short", () => {
        expect(dirtyRadiusForPreset("Short")).toBe(190);
    });
});
