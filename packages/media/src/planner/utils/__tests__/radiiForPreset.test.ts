import { describe, expect, it } from "vitest";
import { radiiForPreset } from "../radiiForPreset";

describe("radiiForPreset", () => {
    it("gives 384 and 414 px for Long", () => {
        expect(radiiForPreset("Long")).toEqual({
            enterRadius: 384,
            exitRadius: 414,
        });
    });

    it("gives 160 and 190 px for Short", () => {
        expect(radiiForPreset("Short")).toEqual({
            enterRadius: 160,
            exitRadius: 190,
        });
    });

    it("follows the tile size", () => {
        expect(radiiForPreset("Short", 10)).toEqual({
            enterRadius: 50,
            exitRadius: 80,
        });
    });
});
