// The levels the zoom buttons step through. The first and the last are also
// the limits of the wheel, which zooms continuously between them.
export const TILE_ZOOMS = [1, 2, 3, 4, 6, 8] as const;

export type TileZoom = number;

export const DEFAULT_TILE_ZOOM: TileZoom = 3;

// How far below the top of the area the sheet opens, in px.
export const TILE_SHEET_TOP_GAP_PX = 64;

// The room the sheet leaves at its sides, in px: the padding of the area, which
// keeps it clear of the panels that float over it.
export const TILE_SHEET_PADDING_PX = 128;
