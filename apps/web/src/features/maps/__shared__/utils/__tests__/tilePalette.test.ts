import { describe, expect, it } from "vitest";
import { TILE_CATEGORIES, TILE_SIZE } from "@standin/contracts";
import { getDefaultTileset } from "@/features/maps/__shared__/utils/getDefaultTileset";
import { getPaletteTileCutout } from "@/features/maps/__shared__/utils/getPaletteTileCutout";
import { getPaletteTiles } from "@/features/maps/__shared__/utils/getPaletteTiles";
import { getTileLayer } from "@/features/maps/__shared__/utils/getTileLayer";

describe("getTileLayer", () => {
    it("maps each category to its layer", () => {
        expect(getTileLayer(TILE_CATEGORIES.FLOOR)).toBe("ground");
        expect(getTileLayer(TILE_CATEGORIES.WALL)).toBe("walls");
        expect(getTileLayer(TILE_CATEGORIES.DECORATION)).toBe("furniture");
        expect(getTileLayer(TILE_CATEGORIES.CEILING)).toBe("foreground");
    });

    it("has no layer for the empty tile", () => {
        expect(getTileLayer(TILE_CATEGORIES.EMPTY)).toBeNull();
    });
});

describe("getPaletteTileCutout", () => {
    const tileset = {
        widthPx: 300,
        heightPx: 200,
        columns: 4,
        margin: 2,
        spacing: 1,
    };

    it("finds the pixel of a tile from index, columns, margin and spacing", () => {
        const step = TILE_SIZE + 1;

        expect(getPaletteTileCutout(tileset, 0, 2, "/t.png")).toMatchObject({
            srcX: 2,
            srcY: 2,
            zoom: 2,
        });
        expect(getPaletteTileCutout(tileset, 5, 2, "/t.png")).toMatchObject({
            srcX: 2 + step,
            srcY: 2 + step,
        });
    });
});

describe("getPaletteTiles", () => {
    const tileset = {
        tileMeta: {
            "3": { category: TILE_CATEGORIES.WALL, solid: true, top: 1 },
            "1": { category: TILE_CATEGORIES.FLOOR },
            "2": { category: TILE_CATEGORIES.EMPTY },
        },
    };

    it("lists the tiles with an entry, in order, leaving the empty out", () => {
        expect(getPaletteTiles(tileset, null)).toEqual([
            { index: 1, category: "FLOOR", solid: false, hasTop: false },
            { index: 3, category: "WALL", solid: true, hasTop: true },
        ]);
    });

    it("filters by category", () => {
        const tiles = getPaletteTiles(tileset, TILE_CATEGORIES.WALL);

        expect(tiles.map((tile) => tile.index)).toEqual([3]);
    });

    it("has no tile when the tileset is untagged", () => {
        expect(getPaletteTiles({ tileMeta: null }, null)).toEqual([]);
    });
});

describe("getDefaultTileset", () => {
    it("prefers the first tileset with a tagged tile", () => {
        const untagged = { id: "a", tileMeta: null };
        const tagged = {
            id: "b",
            tileMeta: { "0": { category: TILE_CATEGORIES.FLOOR } },
        };

        expect(getDefaultTileset([untagged, tagged] as never).id).toBe("b");
        expect(getDefaultTileset([untagged] as never).id).toBe("a");
    });
});
