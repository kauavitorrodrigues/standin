import { describe, expect, it } from "vitest";
import { getEffectiveTool, getModeTools } from "../getModeTools";

describe("getModeTools", () => {
    it("gives the collision all the tools", () => {
        expect(getModeTools("collision", false)).toEqual([
            "brush",
            "rect",
            "bucket",
            "erase",
        ]);
    });

    it("gives the footprint the brush only where tiles can be painted", () => {
        expect(getModeTools("footprint", true)).toEqual([
            "rect",
            "brush",
            "erase",
        ]);
        expect(getModeTools("footprint", false)).toEqual(["rect", "erase"]);
    });

    it("gives the crop the rectangle and the eraser", () => {
        expect(getModeTools("crop", false)).toEqual(["rect", "erase"]);
    });
});

describe("getEffectiveTool", () => {
    it("falls back to the first tool the layer has", () => {
        expect(getEffectiveTool("footprint", "bucket", true)).toBe("rect");
        expect(getEffectiveTool("collision", "bucket", true)).toBe("bucket");
        expect(getEffectiveTool("crop", "erase", false)).toBe("erase");
    });
});
