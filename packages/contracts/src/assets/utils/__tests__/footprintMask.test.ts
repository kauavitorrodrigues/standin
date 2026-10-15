import { describe, expect, it } from "vitest";
import { SOLID_MASK_SUBDIVISION } from "../../consts/library";
import {
    deriveTileMask,
    isFootprintMaskFitting,
    isFootprintSolidMaskFitting,
} from "../footprintMask";

const S = SOLID_MASK_SUBDIVISION;

// A grid of cells for a footprint of w x h tiles, all empty.
const emptyCells = (w: number, h: number) =>
    Array.from({ length: h * S }, () => Array(w * S).fill(false) as boolean[]);

describe("isFootprintMaskFitting", () => {
    it("accepts no mask and a fitting one", () => {
        expect(isFootprintMaskFitting({ w: 2, h: 1 })).toBe(true);
        expect(
            isFootprintMaskFitting({ w: 2, h: 1, mask: [[true, false]] })
        ).toBe(true);
    });

    it("refuses a wrong size or a mask with nothing occupied", () => {
        expect(isFootprintMaskFitting({ w: 2, h: 1, mask: [[true]] })).toBe(
            false
        );
        expect(
            isFootprintMaskFitting({ w: 2, h: 1, mask: [[false, false]] })
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

    it("refuses a solid cell on a tile the tile mask leaves free", () => {
        const cells = emptyCells(2, 1);
        cells[0]![S] = true;
        expect(
            isFootprintSolidMaskFitting({
                w: 2,
                h: 1,
                mask: [[true, false]],
                solidMask: cells,
            })
        ).toBe(false);
        expect(
            isFootprintSolidMaskFitting({
                w: 2,
                h: 1,
                mask: [[true, true]],
                solidMask: cells,
            })
        ).toBe(true);
    });
});

describe("deriveTileMask", () => {
    it("occupies a tile as soon as one of its cells is solid", () => {
        const cells = emptyCells(2, 1);
        cells[S - 1]![0] = true;
        expect(deriveTileMask(cells, 2, 1)).toEqual([[true, false]]);
    });

    it("returns null when every tile has a solid cell", () => {
        const cells = emptyCells(2, 1);
        cells[0]![0] = true;
        cells[0]![S] = true;
        expect(deriveTileMask(cells, 2, 1)).toBeNull();
    });
});
