import { describe, expect, it } from "vitest";
import { combineSelection } from "../combineSelection";
import { getFillArea } from "../getFillArea";
import { getNeighborTile } from "../getNeighborTile";
import { getSelectionMode } from "../getSelectionMode";
import { getTileBrush } from "../getBrush";
import { getTilesOfSameCategory } from "../getSameCategory";
import { getToolPreview } from "../getToolPreview";
import { getTileFloodFill } from "../getFloodFill";
import { getTileLine } from "../getLine";
import { getTileShape } from "../getShape";
import { usesBrush } from "../toolRules";

// A 4 x 3 sheet:
//  0  1  2  3
//  4  5  6  7
//  8  9 10 11
const grid = { columns: 4, rows: 3 };

describe("getTileLine", () => {
    it("is the tile itself when the line does not move", () => {
        expect(getTileLine(5, 5, 4)).toEqual([5]);
    });

    it("walks a row, a column and a diagonal", () => {
        expect(getTileLine(4, 7, 4)).toEqual([4, 5, 6, 7]);
        expect(getTileLine(1, 9, 4)).toEqual([1, 5, 9]);
        expect(getTileLine(0, 10, 4)).toEqual([0, 5, 10]);
    });

    it("works backwards", () => {
        expect(getTileLine(7, 4, 4)).toEqual([7, 6, 5, 4]);
    });
});

describe("getTileShape", () => {
    it("draws a line or fills a rectangle", () => {
        expect(getTileShape("line", 0, 5, 4)).toEqual([0, 5]);
        expect(getTileShape("rect", 0, 5, 4)).toEqual([0, 1, 4, 5]);
    });
});

describe("getTileFloodFill", () => {
    it("fills the untagged tiles that touch the start", () => {
        const meta = {
            "1": { category: "WALL" as const },
            "5": { category: "WALL" as const },
            "9": { category: "WALL" as const },
        };
        expect(getTileFloodFill(meta, 0, grid).sort((a, b) => a - b)).toEqual([
            0, 4, 8,
        ]);
    });

    it("fills only the tiles of the category it started on", () => {
        const meta = {
            "0": { category: "FLOOR" as const },
            "1": { category: "FLOOR" as const },
            "2": { category: "WALL" as const },
            "5": { category: "FLOOR" as const },
            "11": { category: "FLOOR" as const },
        };
        expect(getTileFloodFill(meta, 0, grid).sort((a, b) => a - b)).toEqual([
            0, 1, 5,
        ]);
    });
});

describe("getTileBrush", () => {
    it("takes the category of the tile, or nothing when it has none", () => {
        const meta = { "2": { category: "EMPTY" as const } };
        expect(getTileBrush(meta, 2)).toBe("EMPTY");
        expect(getTileBrush(meta, 3)).toBeNull();
    });
});

describe("usesBrush", () => {
    it("is true for the tools that paint", () => {
        expect(
            ["paint", "line", "rect", "bucket"].every((t) =>
                usesBrush(t as never)
            )
        ).toBe(true);
        expect(usesBrush("select")).toBe(false);
        expect(usesBrush("picker")).toBe(false);
    });
});

describe("combineSelection", () => {
    const base = [1, 2, 3];

    it("joins a pick to the selection the way the mode says", () => {
        expect(combineSelection(base, [3, 4], "replace")).toEqual([3, 4]);
        expect(combineSelection(base, [3, 4], "add")).toEqual([1, 2, 3, 4]);
        expect(combineSelection(base, [3, 4], "subtract")).toEqual([1, 2]);
        expect(combineSelection(base, [3, 4], "intersect")).toEqual([3]);
    });
});

describe("getSelectionMode", () => {
    const keys = { shiftKey: false, ctrlKey: false, metaKey: false };

    it("reads the keys held while picking", () => {
        expect(getSelectionMode(keys)).toBe("replace");
        expect(getSelectionMode({ ...keys, shiftKey: true })).toBe("add");
        expect(getSelectionMode({ ...keys, ctrlKey: true })).toBe("subtract");
        expect(getSelectionMode({ ...keys, metaKey: true })).toBe("subtract");
        expect(
            getSelectionMode({ ...keys, ctrlKey: true, shiftKey: true })
        ).toBe("intersect");
    });
});

describe("getTilesOfSameCategory", () => {
    it("takes every tile with the category, touching or not", () => {
        const meta = {
            "0": { category: "FLOOR" as const },
            "5": { category: "FLOOR" as const },
            "6": { category: "WALL" as const },
        };
        expect(getTilesOfSameCategory(meta, 0, 8)).toEqual([0, 5]);
        expect(getTilesOfSameCategory(meta, 1, 8)).toEqual([1, 2, 3, 4, 7]);
    });
});

describe("getFillArea", () => {
    const meta = {
        "0": { category: "FLOOR" as const },
        "3": { category: "FLOOR" as const },
    };
    const wide = { columns: 4, rows: 3, tileCount: 12 } as never;

    it("fills what touches the tile, or the whole sheet", () => {
        expect(getFillArea(meta, 0, wide, true)).toEqual([0]);
        expect(getFillArea(meta, 0, wide, false)).toEqual([0, 3]);
    });
});

describe("getNeighborTile", () => {
    it("moves one tile, and stays at the edges", () => {
        expect(getNeighborTile(5, "right", grid)).toBe(6);
        expect(getNeighborTile(5, "down", grid)).toBe(9);
        expect(getNeighborTile(5, "left", grid)).toBe(4);
        expect(getNeighborTile(5, "up", grid)).toBe(1);
        expect(getNeighborTile(0, "up", grid)).toBe(0);
        expect(getNeighborTile(3, "right", grid)).toBe(3);
        expect(getNeighborTile(11, "down", grid)).toBe(11);
    });
});

describe("getToolPreview", () => {
    const meta = {
        "0": { category: "FLOOR" as const },
        "1": { category: "FLOOR" as const },
    };
    const sheet = { columns: 4, rows: 3, tileCount: 12 } as never;
    const base = { meta, grid: sheet, contiguous: true, hovered: 0 };

    it("outlines what the tool would touch", () => {
        expect(getToolPreview({ ...base, tool: "bucket" })).toEqual([0, 1]);
        expect(getToolPreview({ ...base, tool: "wand" })).toEqual([0, 1]);
        expect(getToolPreview({ ...base, tool: "same" })).toEqual([0, 1]);
    });

    it("is nothing for the other tools, or without a tile under the pointer", () => {
        expect(getToolPreview({ ...base, tool: "paint" })).toEqual([]);
        expect(
            getToolPreview({ ...base, tool: "bucket", hovered: null })
        ).toEqual([]);
    });
});
