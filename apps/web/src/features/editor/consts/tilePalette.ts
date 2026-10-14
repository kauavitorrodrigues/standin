import { TILE_CATEGORIES } from "@standin/contracts";

// Zoom of the tiles in the palette. The cut is never smoothed. 1.875 makes a
// tile 60 px, so four fit in a row of the side panel with a small gap.
export const TILE_PALETTE_ZOOM = 1.875;

// Tiles in each row of the palette.
export const TILE_PALETTE_COLUMNS = 4;

// The categories a tile can be painted with, in the order of the chips. A
// tile with the EMPTY category has no layer, so the palette leaves it out.
export const TILE_PALETTE_CATEGORIES = [
    TILE_CATEGORIES.FLOOR,
    TILE_CATEGORIES.WALL,
    TILE_CATEGORIES.DECORATION,
    TILE_CATEGORIES.CEILING,
] as const;
