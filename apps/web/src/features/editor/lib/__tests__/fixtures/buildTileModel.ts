import { LAYOUT_LAYER_NAMES, TILE_SIZE } from "@standin/contracts";
import type {
    AssetDefinition,
    EditorModel,
    LibraryPalette,
    MapLayout,
    Tileset,
} from "@standin/contracts";

export const FLOOR_TILE = 0;
export const WALL_TILE = 1;
export const DECO_TILE = 2;

const tileLayer = (id: number, name: string, size: number) => ({
    id,
    type: "tilelayer",
    name,
    x: 0,
    y: 0,
    width: size,
    height: size,
    visible: true,
    opacity: 1,
    data: new Array<number>(size * size).fill(0),
});

type Options = {
    size?: number;
    placed?: EditorModel["placed"];
    assets?: Partial<AssetDefinition>[];
};

// A square map with the four tile layers empty and one tileset in the library
// (a floor tile, a wall tile and a decoration tile).
export const buildTileModel = ({
    size = 6,
    placed = [],
    assets = [],
}: Options = {}): EditorModel => {
    const layout = {
        orientation: "orthogonal",
        renderorder: "right-down",
        infinite: false,
        tilewidth: TILE_SIZE,
        tileheight: TILE_SIZE,
        width: size,
        height: size,
        nextlayerid: 5,
        nextobjectid: 1,
        tilesets: [{ name: "ts-1", firstgid: 1 }],
        layers: Object.values(LAYOUT_LAYER_NAMES).map((name, index) =>
            tileLayer(index + 1, name, size)
        ),
    } as unknown as MapLayout;

    const tileset = {
        id: "ts-1",
        name: "Tileset",
        tileCount: 16,
        tileMeta: {
            [FLOOR_TILE]: { category: "FLOOR" },
            [WALL_TILE]: { category: "WALL", solid: true },
            [DECO_TILE]: { category: "DECORATION" },
        },
    } as unknown as Tileset;

    return {
        mapId: "map-1",
        width: size,
        height: size,
        layout,
        placed,
        library: {
            tilesets: [tileset],
            assets,
            categories: [],
        } as unknown as LibraryPalette,
        desks: [],
        limits: { objectsUsed: 0, objectsMax: 100 },
        version: 1,
    };
};
