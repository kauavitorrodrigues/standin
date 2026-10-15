import { describe, expect, it } from "vitest";
import { toLayoutLibrary } from "../toLayoutLibrary";
import type { LibraryPalette } from "../../../../assets/types/library";

const tileset = (id: string, tileCount: number, tileMeta: unknown) => ({
    id,
    name: id,
    url: `/${id}.png`,
    widthPx: 128,
    heightPx: 128,
    columns: 4,
    tileCount,
    margin: 0,
    spacing: 0,
    tileMeta,
});

describe("toLayoutLibrary", () => {
    it("indexes the tilesets by id with count and tile meta", () => {
        const meta = { "0": { category: "FLOOR", blankDefault: true } };
        const palette = {
            tilesets: [tileset("floor", 16, meta), tileset("wall", 8, null)],
            assets: [],
            categories: [],
        } as unknown as LibraryPalette;

        expect(toLayoutLibrary(palette)).toEqual({
            tilesets: {
                floor: {
                    id: "floor",
                    organizationId: null,
                    tileCount: 16,
                    tileMeta: meta,
                },
                wall: {
                    id: "wall",
                    organizationId: null,
                    tileCount: 8,
                    tileMeta: null,
                },
            },
        });
    });

    it("returns an empty library for an empty palette", () => {
        const palette: LibraryPalette = {
            tilesets: [],
            assets: [],
            categories: [],
        };
        expect(toLayoutLibrary(palette)).toEqual({ tilesets: {} });
    });
});
