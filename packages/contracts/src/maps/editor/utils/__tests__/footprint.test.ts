import { describe, expect, it } from "vitest";
import { footprintCells } from "../footprintCells";
import { footprintsOverlap } from "../footprintsOverlap";
import { getFootprintCells } from "../getFootprintCells";
import { isFootprintInside } from "../isFootprintInside";
import { isFootprintInsideMap } from "../isFootprintInsideMap";

const desk = { tileX: 10, tileY: 8, width: 2, height: 1 };
const map = { width: 24, height: 16 };

describe("footprintCells", () => {
    it("returns a single cell for a 1x1 footprint", () => {
        expect(footprintCells({ footprint: { w: 1, h: 1 } }, 4, 7)).toEqual([
            { x: 4, y: 7 },
        ]);
    });

    it("anchors a 2x3 footprint at the bottom left going right and up", () => {
        const cells = footprintCells({ footprint: { w: 2, h: 3 } }, 5, 9);

        expect(cells).toHaveLength(6);
        expect(cells).toEqual([
            { x: 5, y: 7 },
            { x: 5, y: 8 },
            { x: 5, y: 9 },
            { x: 6, y: 7 },
            { x: 6, y: 8 },
            { x: 6, y: 9 },
        ]);
    });

    it("matches the low level function", () => {
        expect(footprintCells({ footprint: { w: 2, h: 2 } }, 2, 5)).toEqual(
            getFootprintCells({ tileX: 2, tileY: 5, width: 2, height: 2 })
        );
    });
});

describe("isFootprintInsideMap", () => {
    it("accepts footprints touching every map edge", () => {
        expect(
            isFootprintInsideMap(
                { tileX: 0, tileY: 15, width: 24, height: 16 },
                map
            )
        ).toBe(true);
        expect(
            isFootprintInsideMap(
                { tileX: 0, tileY: 0, width: 1, height: 1 },
                map
            )
        ).toBe(true);
    });

    it("rejects footprints crossing an edge", () => {
        expect(isFootprintInsideMap({ ...desk, tileX: 23 }, map)).toBe(false);
        expect(isFootprintInsideMap({ ...desk, tileY: 16 }, map)).toBe(false);
        expect(isFootprintInsideMap({ ...desk, tileX: -1 }, map)).toBe(false);
        expect(
            isFootprintInsideMap(
                { tileX: 0, tileY: 0, width: 1, height: 2 },
                map
            )
        ).toBe(false);
    });
});

describe("isFootprintInside", () => {
    it("checks that an item sits inside its parent", () => {
        const monitor = { tileX: 10, tileY: 8, width: 1, height: 1 };

        expect(isFootprintInside(monitor, desk)).toBe(true);
        expect(isFootprintInside({ ...monitor, tileX: 12 }, desk)).toBe(false);
        expect(isFootprintInside({ ...monitor, tileY: 9 }, desk)).toBe(false);
    });
});

describe("footprintsOverlap", () => {
    it("detects overlaps and lets neighbours touch", () => {
        expect(footprintsOverlap(desk, { ...desk, tileX: 11 })).toBe(true);
        expect(footprintsOverlap(desk, { ...desk, tileX: 12 })).toBe(false);
        expect(footprintsOverlap(desk, { ...desk, tileY: 9 })).toBe(false);
    });
});
