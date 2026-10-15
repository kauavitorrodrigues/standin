import type { PlacedRect } from "@/features/game/utils/placed";

// What a wall tile does in the game, from the properties of its tile in the
// tileset (see `WALL_TILE_PROPERTIES` in the contracts).
export type WallTileMeta = {
    // The whole tile blocks the way, when there is no collision mask.
    solid: boolean;
    // The cells that block, four rows and four flags, or null for none.
    solidMask: boolean[][] | null;
    // Rows from the top of the tile that draw over an avatar in front of it.
    overlap: number;
    // Local index of the tile drawn on the row above, which is the top of a
    // wall that is taller than a tile. Null for a wall with no top.
    top: number | null;
};

export type WallTileEntry = {
    column: number;
    row: number;
    gid: number;
    meta: WallTileMeta;
};

// One piece of the sprite of a wall tile, drawn at its own depth. A crop
// of null is the whole tile.
export type WallTileSlice = {
    crop: { y: number; height: number } | null;
    depth: number;
};

export type WallTileDrawing = {
    slices: WallTileSlice[];
    // The tile of the top, on the row above, with its depth. Null when the
    // wall has no top.
    top: { row: number; gid: number; depth: number } | null;
};

export type WallTileRects = PlacedRect[];
