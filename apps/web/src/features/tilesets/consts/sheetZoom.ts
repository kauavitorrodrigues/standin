// The zooms of the sheet, whole numbers only so the pixels stay sharp. The
// wheel steps through them.
export const TILE_ZOOMS = [1, 2, 3, 4, 6, 8] as const;

export type TileZoom = (typeof TILE_ZOOMS)[number];

export const DEFAULT_TILE_ZOOM: TileZoom = 3;

// How far the wheel has to turn, in px of `deltaY`, for one step of zoom. A
// mouse notch is 100, and a trackpad adds up small moves to it.
export const TILE_ZOOM_WHEEL_STEP = 50;

// How far below the top of the area the sheet opens, in px.
export const TILE_SHEET_TOP_GAP_PX = 64;

// The room the sheet leaves at its sides, in px: the padding of the area, which
// keeps it clear of the panels that float over it.
export const TILE_SHEET_PADDING_PX = 128;
