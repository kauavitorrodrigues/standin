import { describe, expect, it } from "vitest";
import {
    clearSolidTile,
    countSolidCapacity,
    countSolidCells,
    fillSolidMask,
    getCellsBetween,
    getFloodCells,
    getRectCells,
    getSolidRuns,
    paintSolidCells,
    resolveSolidMask,
    toggleTileMasks,
    toPayloadSolidMask,
} from "../solidMask";

const footprint = { w: 2, h: 1, offsetX: 0 };

// A grid of 8 x 4 cells with only the given cells solid.
const cellsWith = (solid: [number, number][]) => {
    const cells = Array.from({ length: 4 }, () => Array(8).fill(false));
    for (const [col, row] of solid) cells[row][col] = true;
    return cells;
};

describe("fillSolidMask", () => {
    it("makes every cell of the occupied tiles solid", () => {
        const cells = fillSolidMask(footprint, [[true, false]]);
        expect(countSolidCells(cells)).toBe(16);
        expect(cells[0][3]).toBe(true);
        expect(cells[0][4]).toBe(false);
    });

    it("fills the whole rectangle without a tile mask", () => {
        expect(countSolidCells(fillSolidMask(footprint, null))).toBe(32);
        expect(countSolidCapacity(footprint, null)).toBe(32);
    });
});

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

describe("paintSolidCells", () => {
    it("erases from the occupied tiles when there is no collision mask", () => {
        const result = paintSolidCells({
            footprint,
            masks: { mask: null, solidMask: null },
            cells: [{ col: 0, row: 0 }],
            action: "erase",
        });
        expect(result.mask).toBeNull();
        expect(result.solidMask?.[0][0]).toBe(false);
        expect(countSolidCells(result.solidMask ?? [])).toBe(31);
    });

    it("occupies the tile of a cell painted in a free tile", () => {
        const result = paintSolidCells({
            footprint,
            masks: { mask: [[true, false]], solidMask: null },
            cells: [{ col: 5, row: 2 }],
            action: "paint",
        });
        expect(result.mask).toBeNull();
        expect(result.solidMask?.[2][5]).toBe(true);
        expect(result.solidMask?.[2][6]).toBe(false);
    });

    it("keeps the masks when nothing changes", () => {
        const masks = { mask: null, solidMask: cellsWith([[0, 0]]) };
        expect(
            paintSolidCells({
                footprint,
                masks,
                cells: [
                    { col: 0, row: 0 },
                    { col: 99, row: 0 },
                ],
                action: "paint",
            })
        ).toBe(masks);
    });

    it("does not erase the last solid cell", () => {
        const masks = { mask: null, solidMask: cellsWith([[3, 1]]) };
        const result = paintSolidCells({
            footprint,
            masks,
            cells: [{ col: 3, row: 1 }],
            action: "erase",
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
        const result = paintSolidCells({
            footprint,
            masks,
            cells: getCellsBetween({ col: 0, row: 0 }, { col: 2, row: 0 }),
            action: "erase",
        });
        expect(countSolidCells(result.solidMask ?? [])).toBe(1);
        expect(result.solidMask?.[0][2]).toBe(true);
    });

    it("goes back to no collision mask when the cells match the tiles again", () => {
        const solidMask = fillSolidMask(footprint, null);
        solidMask[0][0] = false;
        const result = paintSolidCells({
            footprint,
            masks: { mask: null, solidMask },
            cells: [{ col: 0, row: 0 }],
            action: "paint",
        });
        expect(result.solidMask).toBeNull();
    });

    it("ignores cells outside the footprint", () => {
        const masks = { mask: null, solidMask: null };
        expect(
            paintSolidCells({
                footprint,
                masks,
                cells: [
                    { col: -1, row: 0 },
                    { col: 0, row: 4 },
                ],
                action: "erase",
            })
        ).toBe(masks);
    });
});

describe("clearSolidTile", () => {
    it("empties the cells of one tile", () => {
        const cells = cellsWith([
            [1, 1],
            [5, 1],
        ]);
        const result = clearSolidTile(cells, { col: 0, row: 0 });
        expect(result?.[1][1]).toBe(false);
        expect(result?.[1][5]).toBe(true);
    });

    it("is null when no solid cell is left", () => {
        expect(
            clearSolidTile(cellsWith([[1, 1]]), { col: 0, row: 0 })
        ).toBeNull();
    });
});

describe("toggleTileMasks", () => {
    it("clears the solid cells of a tile that gets freed", () => {
        const result = toggleTileMasks(
            footprint,
            {
                mask: null,
                solidMask: cellsWith([
                    [1, 1],
                    [5, 1],
                ]),
            },
            { col: 0, row: 0 }
        );
        expect(result.mask).toEqual([[false, true]]);
        expect(countSolidCells(result.solidMask ?? [])).toBe(1);
    });

    it("drops the collision mask when the freed tile held all the cells", () => {
        const result = toggleTileMasks(
            footprint,
            { mask: null, solidMask: cellsWith([[1, 1]]) },
            { col: 0, row: 0 }
        );
        expect(result.solidMask).toBeNull();
    });

    it("keeps the collision mask when a tile is occupied again", () => {
        const solidMask = cellsWith([[1, 1]]);
        const result = toggleTileMasks(
            footprint,
            { mask: [[true, false]], solidMask },
            { col: 1, row: 0 }
        );
        expect(result.mask).toBeNull();
        expect(result.solidMask).toBe(solidMask);
    });

    it("keeps everything when the last occupied tile cannot be freed", () => {
        const masks = { mask: [[true, false]], solidMask: cellsWith([[1, 1]]) };
        expect(toggleTileMasks(footprint, masks, { col: 0, row: 0 })).toBe(
            masks
        );
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

describe("resolveSolidMask", () => {
    it("is the collision mask when there is one", () => {
        const cells = cellsWith([[0, 0]]);
        expect(resolveSolidMask(footprint, null, cells)).toBe(cells);
    });
});

describe("toPayloadSolidMask", () => {
    const base = {
        footprint,
        mask: null,
        solidMask: cellsWith([[0, 0]]),
        solid: true,
        isAnimated: false,
    };

    it("goes up for a still asset that blocks", () => {
        expect(toPayloadSolidMask(base)).toBe(base.solidMask);
    });

    it("stays out when the asset does not block or is animated", () => {
        expect(toPayloadSolidMask({ ...base, solid: false })).toBeNull();
        expect(toPayloadSolidMask({ ...base, isAnimated: true })).toBeNull();
    });

    it("stays out when it blocks like the occupied tiles", () => {
        const solidMask = fillSolidMask(footprint, null);
        expect(toPayloadSolidMask({ ...base, solidMask })).toBeNull();
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

describe("getFloodCells", () => {
    const masks = {
        mask: null,
        solidMask: cellsWith([
            [0, 0],
            [1, 0],
        ]),
    };

    it("reaches the connected area in the same state", () => {
        const empty = getFloodCells(footprint, masks, { col: 5, row: 2 });
        expect(empty).toHaveLength(32 - 2);
        const solid = getFloodCells(footprint, masks, { col: 0, row: 0 });
        expect(solid).toHaveLength(2);
    });

    it("does nothing from a cell of a free tile", () => {
        const freed = { mask: [[true, false]], solidMask: null };
        expect(getFloodCells(footprint, freed, { col: 5, row: 1 })).toEqual([]);
    });

    it("stops at the free tiles", () => {
        const freed = { mask: [[true, false]], solidMask: null };
        expect(
            getFloodCells(footprint, freed, { col: 1, row: 1 })
        ).toHaveLength(16);
    });
});
