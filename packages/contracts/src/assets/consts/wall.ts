import { SOLID_MASK_SUBDIVISION } from "./library";

// The collision of a wall tile uses the same grid as the one of an asset, so a
// wall trace of 4 px blocks the 8 px cell that holds it.
export const WALL_COLLISION_SUBDIVISION = SOLID_MASK_SUBDIVISION;

// Longest name of a wall style, such as "Tijolo" or "Vidro".
export const WALL_STYLE_NAME_MAX = 40;

// The most rows of the tile, counted from the top, that a wall piece without a
// top draws over an avatar behind it. A whole tile is 32 rows.
export const WALL_OVERLAP_MAX = 32;

// The names of the custom properties a wall tile carries in the tileset the
// map render serves (Tiled `tiles[].properties`), which is how the game and
// the editor learn what a wall tile blocks and covers. `solidMask` is a JSON
// string of the four by four grid of flags.
export const WALL_TILE_PROPERTIES = {
    SOLID: "solid",
    SOLID_MASK: "solidMask",
    OVERLAP: "overlap",
    TOP: "top",
} as const;
