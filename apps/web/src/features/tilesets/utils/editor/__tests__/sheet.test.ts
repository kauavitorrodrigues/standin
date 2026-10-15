import { describe, expect, it } from "vitest";
import { getTileAt, getTileRect } from "../getAt";
import { getTilesetGrid } from "../../grid/getGrid";
import {
    clearTileCategory,
    isSameTileMeta,
    setTileBlankDefault,
    setTileCategory,
    setTileSolid,
    setTileTop,
} from "../metaEdit";

const anyone = () => true;

describe("getTilesetGrid", () => {
    it("reads the columns, rows and tiles of a plain sheet", () => {
        expect(getTilesetGrid({ w: 128, h: 64 }, 0, 0)).toEqual({
            columns: 4,
            rows: 2,
            margin: 0,
            spacing: 0,
            widthPx: 128,
            heightPx: 64,
            tileCount: 8,
        });
    });

    it("counts the margin and the spacing", () => {
        expect(getTilesetGrid({ w: 68, h: 34 }, 1, 2)?.columns).toBe(2);
    });

    it("is null when the sheet is not made of whole cells", () => {
        expect(getTilesetGrid({ w: 100, h: 64 }, 0, 0)).toBeNull();
    });
});

describe("getTileAt", () => {
    const grid = getTilesetGrid({ w: 128, h: 64 }, 0, 0)!;

    it("finds the tile under a point", () => {
        expect(getTileAt({ x: 40, y: 40 }, grid)).toBe(5);
    });

    it("keeps a point outside the sheet on the closest tile", () => {
        expect(getTileAt({ x: -10, y: 500 }, grid)).toBe(4);
        expect(getTileAt({ x: 900, y: -5 }, grid)).toBe(3);
    });

    it("selects the rectangle between two tiles", () => {
        expect(getTileRect(1, 6, 4)).toEqual([1, 2, 5, 6]);
        expect(getTileRect(6, 1, 4)).toEqual([1, 2, 5, 6]);
    });
});

describe("tile meta edits", () => {
    it("gives a category and drops what does not apply to it", () => {
        const meta = {
            "0": {
                category: "WALL" as const,
                solid: true,
                top: 3,
                blankDefault: true,
            },
        };
        expect(setTileCategory(meta, [0], "CEILING", anyone)).toEqual({
            "0": { category: "CEILING", solid: true },
        });
        expect(setTileCategory(meta, [0], "FLOOR", anyone)).toEqual({
            "0": { category: "FLOOR", solid: true, blankDefault: true },
        });
        expect(setTileCategory(meta, [0], "EMPTY", anyone)).toEqual({
            "0": { category: "EMPTY", solid: true },
        });
    });

    it("leaves a tile that cannot be edited alone", () => {
        const meta = { "0": { category: "FLOOR" as const } };
        expect(
            setTileCategory(meta, [0, 1], "WALL", (index) => index !== 0)
        ).toEqual({ "0": { category: "FLOOR" }, "1": { category: "WALL" } });
    });

    it("clears a category", () => {
        const meta = { "0": { category: "FLOOR" as const } };
        expect(clearTileCategory(meta, [0], anyone)).toEqual({});
    });

    it("makes only a tile with a category solid, and back", () => {
        const meta = { "0": { category: "FLOOR" as const } };
        const solid = setTileSolid(meta, [0, 1], true, anyone);
        expect(solid).toEqual({ "0": { category: "FLOOR", solid: true } });
        expect(setTileSolid(solid, [0], false, anyone)).toEqual(meta);
    });

    it("keeps one blank default per category", () => {
        const meta = {
            "0": { category: "FLOOR" as const, blankDefault: true },
            "1": { category: "FLOOR" as const },
            "2": { category: "WALL" as const, blankDefault: true },
        };
        expect(setTileBlankDefault(meta, 1, true)).toEqual({
            "0": { category: "FLOOR" },
            "1": { category: "FLOOR", blankDefault: true },
            "2": { category: "WALL", blankDefault: true },
        });
        expect(setTileBlankDefault(meta, 0, false)["0"]).toEqual({
            category: "FLOOR",
        });
    });

    it("only gives a top to a wall", () => {
        const meta = {
            "0": { category: "WALL" as const },
            "1": { category: "FLOOR" as const },
        };
        expect(setTileTop(meta, 0, 5, anyone)["0"]).toEqual({
            category: "WALL",
            top: 5,
        });
        expect(setTileTop(meta, 1, 5, anyone)).toBe(meta);
        expect(
            setTileTop({ "0": { category: "WALL", top: 5 } }, 0, null, anyone)[
                "0"
            ]
        ).toEqual({ category: "WALL" });
    });

    it("compares two metas whatever the order of the keys", () => {
        expect(
            isSameTileMeta(
                {
                    "1": { category: "FLOOR" },
                    "0": { category: "WALL", top: 2 },
                },
                {
                    "0": { top: 2, category: "WALL" },
                    "1": { category: "FLOOR" },
                }
            )
        ).toBe(true);
        expect(isSameTileMeta({ "0": { category: "FLOOR" } }, {})).toBe(false);
    });
});
