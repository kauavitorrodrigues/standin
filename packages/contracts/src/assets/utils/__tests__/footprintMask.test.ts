import { describe, expect, it } from "vitest";
import { SOLID_MASK_SUBDIVISION } from "../../consts/library";
import {
    expandTileMask,
    isFootprintMaskFitting,
    isFootprintSolidMaskFitting,
    isTileMaskFitting,
    isTileOccupiedByMask,
} from "../footprintMask";

const S = SOLID_MASK_SUBDIVISION;

// A grid of cells for a footprint of w x h tiles, all empty.
const emptyCells = (w: number, h: number) =>
    Array.from({ length: h * S }, () => Array(w * S).fill(false) as boolean[]);

describe("isTileMaskFitting", () => {
    it("accepts no mask and a fitting one", () => {
        expect(isTileMaskFitting({ w: 2, h: 1 })).toBe(true);
        expect(isTileMaskFitting({ w: 2, h: 1, mask: [[true, false]] })).toBe(
            true
        );
    });

    it("refuses a wrong size or a mask with nothing occupied", () => {
        expect(isTileMaskFitting({ w: 2, h: 1, mask: [[true]] })).toBe(false);
        expect(isTileMaskFitting({ w: 2, h: 1, mask: [[false, false]] })).toBe(
            false
        );
    });
});

describe("isFootprintMaskFitting", () => {
    it("accepts no mask and a fitting one", () => {
        const cells = emptyCells(2, 1);
        cells[0]![0] = true;
        expect(isFootprintMaskFitting({ w: 2, h: 1 })).toBe(true);
        expect(isFootprintMaskFitting({ w: 2, h: 1, mask: cells })).toBe(true);
    });

    it("refuses a mask with the size of tiles", () => {
        expect(
            isFootprintMaskFitting({ w: 2, h: 1, mask: [[true, true]] })
        ).toBe(false);
    });

    it("refuses a mask with nothing occupied", () => {
        expect(
            isFootprintMaskFitting({ w: 2, h: 1, mask: emptyCells(2, 1) })
        ).toBe(false);
    });
});

describe("isFootprintSolidMaskFitting", () => {
    it("accepts the absence of a collision mask", () => {
        expect(isFootprintSolidMaskFitting({ w: 1, h: 1 })).toBe(true);
    });

    it("accepts the right size with a solid cell", () => {
        const cells = emptyCells(2, 1);
        cells[0]![0] = true;
        expect(
            isFootprintSolidMaskFitting({ w: 2, h: 1, solidMask: cells })
        ).toBe(true);
    });

    it("refuses the wrong size and a mask with no solid cell", () => {
        expect(
            isFootprintSolidMaskFitting({
                w: 2,
                h: 1,
                solidMask: emptyCells(1, 1),
            })
        ).toBe(false);
        expect(
            isFootprintSolidMaskFitting({
                w: 2,
                h: 1,
                solidMask: emptyCells(2, 1),
            })
        ).toBe(false);
    });

    it("refuses a solid cell the footprint mask leaves free", () => {
        const solid = emptyCells(2, 1);
        solid[0]![S] = true;
        const mask = emptyCells(2, 1);
        mask[0]![0] = true;
        expect(
            isFootprintSolidMaskFitting({ w: 2, h: 1, mask, solidMask: solid })
        ).toBe(false);

        mask[0]![S] = true;
        expect(
            isFootprintSolidMaskFitting({ w: 2, h: 1, mask, solidMask: solid })
        ).toBe(true);
    });
});

describe("expandTileMask", () => {
    it("turns every tile into a block of cells", () => {
        const cells = expandTileMask([[true, false]]);
        expect(cells).toHaveLength(S);
        expect(cells?.[0]).toHaveLength(2 * S);
        expect(cells?.[S - 1]?.slice(0, S).every(Boolean)).toBe(true);
        expect(cells?.[S - 1]?.slice(S).some(Boolean)).toBe(false);
    });

    it("keeps no mask as no mask", () => {
        expect(expandTileMask(null)).toBeNull();
        expect(expandTileMask(undefined)).toBeNull();
    });
});

describe("isTileOccupiedByMask", () => {
    it("occupies a tile as soon as one of its cells is", () => {
        const cells = emptyCells(2, 1);
        cells[S - 1]![0] = true;
        expect(isTileOccupiedByMask(cells, 0, 0)).toBe(true);
        expect(isTileOccupiedByMask(cells, 1, 0)).toBe(false);
    });

    it("occupies every tile when there is no mask", () => {
        expect(isTileOccupiedByMask(null, 3, 2)).toBe(true);
    });
});
