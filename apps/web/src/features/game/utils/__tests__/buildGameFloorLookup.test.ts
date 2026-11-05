import { describe, expect, it } from "vitest";
import { TILE_SIZE, type Tileset } from "@standin/contracts";
import type { GameMapData } from "@/features/game/types/tilemap";
import { buildGameFloorLookup } from "../buildGameFloorLookup";

const tileset: Tileset = {
    id: "floor",
    name: "Floor",
    url: "/floor.png",
    widthPx: 32,
    heightPx: 32,
    columns: 1,
    tileCount: 1,
    margin: 0,
    spacing: 0,
    tileMeta: { "0": { category: "FLOOR", material: "STONE" } },
};

// What the server sends: the layout as stored, with the tilesets completed
// (extra Tiled fields included) and a version.
const layout = {
    version: "1.10",
    orientation: "orthogonal",
    renderorder: "right-down",
    infinite: false,
    tilewidth: TILE_SIZE,
    tileheight: TILE_SIZE,
    width: 1,
    height: 1,
    tilesets: [
        { firstgid: 1, name: "floor", tilecount: 1, columns: 1, tiles: [] },
    ],
    layers: [
        {
            id: 1,
            type: "tilelayer",
            name: "ground",
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            visible: true,
            opacity: 1,
            data: [1],
        },
    ],
};

const build = (patch: Partial<GameMapData>): GameMapData =>
    ({
        id: "map",
        width: 1,
        height: 1,
        tileSize: TILE_SIZE,
        layout,
        tilesets: [],
        ...patch,
    }) as GameMapData;

describe("buildGameFloorLookup", () => {
    it("reads the material from the completed layout of the server", () => {
        const lookup = buildGameFloorLookup(
            build({ floorTilesets: [tileset] })
        );

        expect(lookup({ x: 4, y: 4 })).toBe("STONE");
    });

    it("is all wood when the map has no tile meta", () => {
        const lookup = buildGameFloorLookup(build({}));

        expect(lookup({ x: 4, y: 4 })).toBe("WOOD");
    });

    it("is all wood when the layout does not read", () => {
        const lookup = buildGameFloorLookup(
            build({ layout: { width: 1 }, floorTilesets: [tileset] })
        );

        expect(lookup({ x: 4, y: 4 })).toBe("WOOD");
    });
});
