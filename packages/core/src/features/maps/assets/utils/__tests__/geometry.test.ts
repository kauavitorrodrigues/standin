import { describe, expect, it } from "vitest";
import { footprintsOverlap } from "../footprintsOverlap";
import { getFootprintCells } from "../getFootprintCells";
import { isFootprintInside } from "../isFootprintInside";
import { isFootprintInsideMap } from "../isFootprintInsideMap";

const desk = { tileX: 10, tileY: 8, width: 2, height: 1 };

describe("footprint", () => {
    it("lists the cells going right and up from the bottom left", () => {
        expect(
            getFootprintCells({ tileX: 2, tileY: 5, width: 2, height: 2 })
        ).toEqual([
            { x: 2, y: 4 },
            { x: 2, y: 5 },
            { x: 3, y: 4 },
            { x: 3, y: 5 },
        ]);
    });

    it("checks the map bounds", () => {
        const map = { width: 24, height: 16 };

        expect(isFootprintInsideMap(desk, map)).toBe(true);
        expect(isFootprintInsideMap({ ...desk, tileX: 23 }, map)).toBe(false);
        expect(isFootprintInsideMap({ ...desk, tileY: 16 }, map)).toBe(false);
        expect(
            isFootprintInsideMap(
                { tileX: 0, tileY: 0, width: 1, height: 2 },
                map
            )
        ).toBe(false);
    });

    it("checks that an item sits inside its parent", () => {
        const monitor = { tileX: 10, tileY: 8, width: 1, height: 1 };

        expect(isFootprintInside(monitor, desk)).toBe(true);
        expect(isFootprintInside({ ...monitor, tileX: 12 }, desk)).toBe(false);
        expect(isFootprintInside({ ...monitor, tileY: 9 }, desk)).toBe(false);
    });

    it("detects overlaps and lets neighbours touch", () => {
        expect(footprintsOverlap(desk, { ...desk, tileX: 11 })).toBe(true);
        expect(footprintsOverlap(desk, { ...desk, tileX: 12 })).toBe(false);
        expect(footprintsOverlap(desk, { ...desk, tileY: 9 })).toBe(false);
    });
});
