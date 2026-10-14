// The overlay that shows what a tile gesture is about to do. It is drawn
// above the tiles and the objects and below the grid.
export const TILE_PREVIEW = {
    PAINT_COLOR: 0x60a5fa,
    ERASE_COLOR: 0xf87171,
    FILL_ALPHA: 0.45,
    DEPTH: 899,
} as const;

export const TILE_PREVIEW_KINDS = {
    PAINT: "paint",
    ERASE: "erase",
} as const;
