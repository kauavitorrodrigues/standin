import { describe, expect, it } from "vitest";
import { footprintFitsCrop } from "../footprintFitsCrop";

describe("footprintFitsCrop", () => {
    const crop = { x: 0, y: 0, w: 64, h: 96 };

    it("accepts a footprint inside the rectangle", () => {
        expect(footprintFitsCrop(crop, { w: 1, h: 1, offsetX: 1 })).toBe(true);
    });

    it("rejects one that sticks out to the right or the top", () => {
        expect(footprintFitsCrop(crop, { w: 2, h: 1, offsetX: 1 })).toBe(false);
        expect(footprintFitsCrop(crop, { w: 1, h: 4, offsetX: 0 })).toBe(false);
    });
});
