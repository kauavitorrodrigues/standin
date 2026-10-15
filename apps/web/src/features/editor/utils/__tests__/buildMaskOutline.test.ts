import { describe, expect, it } from "vitest";
import { buildMaskOutline } from "../buildMaskOutline";

describe("buildMaskOutline", () => {
    it("draws the four sides of a single cell", () => {
        const segments = buildMaskOutline([[true]], 10, 20, 8);
        expect(segments).toHaveLength(4);
        expect(segments).toContainEqual({ x1: 10, y1: 20, x2: 18, y2: 20 });
        expect(segments).toContainEqual({ x1: 10, y1: 28, x2: 18, y2: 28 });
        expect(segments).toContainEqual({ x1: 10, y1: 20, x2: 10, y2: 28 });
        expect(segments).toContainEqual({ x1: 18, y1: 20, x2: 18, y2: 28 });
    });

    it("leaves no line between two occupied cells", () => {
        const segments = buildMaskOutline([[true, true]], 0, 0, 8);
        expect(segments).toHaveLength(6);
        const shared = segments.filter(({ x1, x2 }) => x1 === 8 && x2 === 8);
        expect(shared).toHaveLength(0);
    });

    it("follows the notch of an L", () => {
        const l = [
            [true, true],
            [true, false],
        ];
        const segments = buildMaskOutline(l, 0, 0, 8);
        // The L has eight sides, each one cell long.
        expect(segments).toHaveLength(8);
        expect(segments).toContainEqual({ x1: 8, y1: 8, x2: 16, y2: 8 });
        expect(segments).toContainEqual({ x1: 8, y1: 8, x2: 8, y2: 16 });
    });

    it("has nothing to draw for an empty mask", () => {
        expect(buildMaskOutline([[false, false]], 0, 0, 8)).toEqual([]);
    });
});
