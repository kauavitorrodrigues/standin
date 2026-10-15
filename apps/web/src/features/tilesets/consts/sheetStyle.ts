// The shade over a tile (or over the whole sheet) that the legend dims.
export const TILE_SHEET_VEIL = "rgba(0, 0, 0, 0.6)";

export const TILE_HOVER_OUTLINE = "1px solid rgba(255, 255, 255, 0.85)";

// The tiles a tool is about to touch, before the click.
export const TILE_PREVIEW_OUTLINE = "2px dashed rgba(255, 255, 255, 0.7)";

// How much of the color of its category tints a tile.
export const TILE_TINT_PERCENT = 32;

// How much of its color tints the category in use in the brush rail.
export const TILE_ACTIVE_TINT_PERCENT = 20;

// The marks on a tile (solid, default of the blank map) are a third of it,
// and never smaller than this, in px.
export const TILE_MARK_DIVISOR = 3;
export const TILE_MARK_MIN_PX = 9;
