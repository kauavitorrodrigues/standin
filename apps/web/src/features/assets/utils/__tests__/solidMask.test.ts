import { describe, expect, it } from "vitest";
import {
    countSolidCells,
    getCellsBetween,
    getFloodCells,
    getRectCells,
    getSolidRuns,
    paintCells,
    resolveSolidMask,
    toPayloadSolidMask,
} from "../solidMask";

const footprint = { w: 2, h: 1, offsetX: 0 };

// A grid of 8 x 4 cells with only the given cells set.
const cellsWith = (solid: [number, number][]) => {
    const cells = Array.from({ length: 4 }, () => Array(8).fill(false));
    for (const [col, row] of solid) cells[row][col] = true;
    return cells;
};
const full = () => Array.from({ length: 4 }, () => Array(8).fill(true));

describe("getCellsBetween", () => {
    it("is the cell itself for a press without a move", () => {
        expect(getCellsBetween({ col: 2, row: 1 }, { col: 2, row: 1 })).toEqual(
            [{ col: 2, row: 1 }]
        );
    });

    it("leaves no gap along a fast horizontal drag", () => {
        const cells = getCellsBetween({ col: 0, row: 2 }, { col: 5, row: 2 });
        expect(cells.map((cell) => cell.col)).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it("walks backwards and diagonally with every cell touching the next", () => {
        const cells = getCellsBetween({ col: 6, row: 3 }, { col: 1, row: 0 });
        expect(cells[0]).toEqual({ col: 6, row: 3 });
        expect(cells[cells.length - 1]).toEqual({ col: 1, row: 0 });
        cells.slice(1).forEach((cell, index) => {
            expect(Math.abs(cell.col - cells[index].col)).toBeLessThanOrEqual(
                1
            );
            expect(Math.abs(cell.row - cells[index].row)).toBeLessThanOrEqual(
                1
            );
        });
    });
});

describe("getSolidRuns", () => {
    it("joins neighbours of a row into one run", () => {
        const runs = getSolidRuns(
            cellsWith([
                [1, 0],
                [2, 0],
                [4, 0],
                [0, 2],
            ])
        );
        expect(runs).toEqual([
            { row: 0, col: 1, length: 2 },
            { row: 0, col: 4, length: 1 },
            { row: 2, col: 0, length: 1 },
        ]);
    });
});

describe("getRectCells", () => {
    it("covers the block between two corners in any order", () => {
        const cells = getRectCells({ col: 3, row: 2 }, { col: 1, row: 1 });
        expect(cells).toHaveLength(6);
        expect(cells).toContainEqual({ col: 1, row: 1 });
        expect(cells).toContainEqual({ col: 3, row: 2 });
    });
});

describe("resolveSolidMask", () => {
    it("follows the occupied cells without a collision mask", () => {
        const mask = cellsWith([[0, 0]]);
        expect(resolveSolidMask(footprint, mask, null)).toBe(mask);
        expect(countSolidCells(resolveSolidMask(footprint, null, null))).toBe(
            32
        );
    });

    it("takes the collision mask when there is one", () => {
        const solid = cellsWith([[1, 1]]);
        expect(resolveSolidMask(footprint, null, solid)).toBe(solid);
    });
});

describe("paintCells in the footprint layer", () => {
    const base = { mask: null, solidMask: null };
    const frees = (cells: { col: number; row: number }[]) =>
        paintCells({
            footprint,
            masks: base,
            cells,
            action: "erase",
            layer: "footprint",
        });

    it("frees a cell of a full footprint, and the collision follows", () => {
        const result = frees([{ col: 3, row: 0 }]);
        expect(result.mask?.[0][3]).toBe(false);
        expect(countSolidCells(result.mask ?? [])).toBe(31);
        expect(result.solidMask).toBeNull();
    });

    it("occupies the cell again and goes back to no mask when full", () => {
        const freed = frees([{ col: 3, row: 0 }]);
        const result = paintCells({
            footprint,
            masks: freed,
            cells: [{ col: 3, row: 0 }],
            action: "paint",
            layer: "footprint",
        });
        expect(result.mask).toBeNull();
    });

    it("stops a freed cell from blocking when the collision is its own", () => {
        const masks = {
            mask: null,
            solidMask: cellsWith([
                [0, 0],
                [1, 0],
            ]),
        };
        const result = paintCells({
            footprint,
            masks,
            cells: [{ col: 0, row: 0 }],
            action: "erase",
            layer: "footprint",
        });
        expect(result.mask?.[0][0]).toBe(false);
        expect(result.solidMask?.[0][0]).toBe(false);
        expect(result.solidMask?.[0][1]).toBe(true);
    });

    it("never frees the last occupied cell", () => {
        const masks = { mask: cellsWith([[2, 2]]), solidMask: null };
        const result = paintCells({
            footprint,
            masks,
            cells: [{ col: 2, row: 2 }],
            action: "erase",
            layer: "footprint",
        });
        expect(result).toBe(masks);
    });

    it("ignores cells outside the footprint", () => {
        const result = frees([
            { col: 99, row: 0 },
            { col: 0, row: -1 },
        ]);
        expect(result).toBe(base);
    });

    it("keeps the masks when nothing changes", () => {
        const result = paintCells({
            footprint,
            masks: base,
            cells: [{ col: 0, row: 0 }],
            action: "paint",
            layer: "footprint",
        });
        expect(result).toBe(base);
    });
});

describe("paintCells in the collision layer", () => {
    it("makes a cell block and occupied", () => {
        const masks = { mask: cellsWith([[0, 0]]), solidMask: null };
        const result = paintCells({
            footprint,
            masks,
            cells: [{ col: 5, row: 2 }],
            action: "paint",
            layer: "collision",
        });
        expect(result.mask?.[2][5]).toBe(true);
        expect(result.mask?.[0][0]).toBe(true);
        // It blocks like the footprint, so there is no collision mask of its own.
        expect(result.solidMask).toBeNull();
    });

    it("stops a cell from blocking without freeing it", () => {
        const result = paintCells({
            footprint,
            masks: { mask: null, solidMask: null },
            cells: [{ col: 0, row: 0 }],
            action: "erase",
            layer: "collision",
        });
        expect(result.mask).toBeNull();
        expect(result.solidMask?.[0][0]).toBe(false);
        expect(countSolidCells(result.solidMask ?? [])).toBe(31);
    });

    it("does not erase the last solid cell", () => {
        const masks = { mask: null, solidMask: cellsWith([[3, 1]]) };
        const result = paintCells({
            footprint,
            masks,
            cells: [{ col: 3, row: 1 }],
            action: "erase",
            layer: "collision",
        });
        expect(result).toBe(masks);
    });

    it("erases a whole stroke but stops before the last cell", () => {
        const masks = {
            mask: null,
            solidMask: cellsWith([
                [0, 0],
                [1, 0],
                [2, 0],
            ]),
        };
        const result = paintCells({
            footprint,
            masks,
            cells: getCellsBetween({ col: 0, row: 0 }, { col: 2, row: 0 }),
            action: "erase",
            layer: "collision",
        });
        expect(countSolidCells(result.solidMask ?? [])).toBe(1);
        expect(result.solidMask?.[0][2]).toBe(true);
    });

    it("goes back to no collision mask when the cells match the footprint", () => {
        const solidMask = full();
        solidMask[0][0] = false;
        const result = paintCells({
            footprint,
            masks: { mask: null, solidMask },
            cells: [{ col: 0, row: 0 }],
            action: "paint",
            layer: "collision",
        });
        expect(result.solidMask).toBeNull();
    });
});

describe("toPayloadSolidMask", () => {
    const params = {
        footprint,
        mask: null,
        solidMask: cellsWith([[0, 0]]),
        solid: true,
        isAnimated: false,
    };

    it("goes up for a still asset that blocks", () => {
        expect(toPayloadSolidMask(params)).toEqual(cellsWith([[0, 0]]));
    });

    it("stays out when it does not block, is animated or is missing", () => {
        expect(toPayloadSolidMask({ ...params, solid: false })).toBeNull();
        expect(toPayloadSolidMask({ ...params, isAnimated: true })).toBeNull();
        expect(toPayloadSolidMask({ ...params, solidMask: null })).toBeNull();
    });

    it("stays out when it blocks like the occupied cells", () => {
        expect(toPayloadSolidMask({ ...params, solidMask: full() })).toBeNull();
    });
});

describe("getFloodCells", () => {
    const masks = {
        mask: cellsWith([
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [3, 1],
        ]),
        solidMask: null,
    };

    it("fills the footprint layer across free and occupied cells alike", () => {
        const reached = getFloodCells(
            footprint,
            masks,
            { col: 7, row: 3 },
            "footprint"
        );
        // The free cells all touch, so the bucket reaches every one of them.
        expect(reached).toHaveLength(32 - 8);
    });

    it("stops at the free cells in the collision layer", () => {
        const reached = getFloodCells(
            footprint,
            masks,
            { col: 0, row: 0 },
            "collision"
        );
        expect(reached).toHaveLength(8);
        expect(reached.every((cell) => cell.col < 4 && cell.row < 2)).toBe(
            true
        );
    });

    it("reaches nothing from a free cell in the collision layer", () => {
        expect(
            getFloodCells(footprint, masks, { col: 7, row: 3 }, "collision")
        ).toEqual([]);
    });
});
