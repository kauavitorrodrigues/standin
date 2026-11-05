import { describe, expect, it } from "vitest";
import { TILE_SIZE, type MapLayout, type Tileset } from "@standin/contracts";
import { buildFloorMaterialLookup } from "../buildFloorMaterialLookup";

// Tile 0 is grass and tile 1 is a floor with no material.
const tileset: Tileset = {
    id: "floor",
    name: "Floor",
    url: "/floor.png",
    widthPx: 64,
    heightPx: 32,
    columns: 2,
    tileCount: 2,
    margin: 0,
    spacing: 0,
    tileMeta: {
        "0": { category: "FLOOR", material: "GRASS" },
        "1": { category: "FLOOR" },
    },
};

// A 3 x 1 map: grass, a floor with no material, and an empty cell.
const layout = {
    width: 3,
    height: 1,
    tilesets: [{ firstgid: 1, name: "floor" }],
    layers: [
        {
            type: "tilelayer",
            name: "ground",
            width: 3,
            height: 1,
            data: [1, 2, 0],
        },
    ],
} as unknown as MapLayout;

describe("buildFloorMaterialLookup", () => {
    const lookup = buildFloorMaterialLookup(layout, [tileset]);

    it("answers the material of the tile under the feet", () => {
        expect(lookup({ x: TILE_SIZE / 2, y: TILE_SIZE - 1 })).toBe("GRASS");
    });

    it("tells two tiles of the same tileset apart", () => {
        expect(lookup({ x: TILE_SIZE + 4, y: 4 })).toBe("WOOD");
    });

    it("answers wood on an empty cell and outside the map", () => {
        expect(lookup({ x: TILE_SIZE * 2 + 4, y: 4 })).toBe("WOOD");
        expect(lookup({ x: -4, y: 4 })).toBe("WOOD");
        expect(lookup({ x: 4, y: TILE_SIZE * 3 })).toBe("WOOD");
    });
});
