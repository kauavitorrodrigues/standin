import {
    DEFAULT_TILE_ZOOM,
    TILE_SHEET_PADDING_PX,
    TILE_ZOOMS,
    type TileZoom,
} from "../../consts/sheetZoom";

// The zoom the sheet opens at: the default, or the largest below it that makes
// the sheet fit the width of the area, so it does not open with a scroll bar.
// A sheet too wide even for the least zoom opens at the least.
export const getFitZoom = (
    sheetWidthPx: number,
    areaWidthPx: number
): TileZoom => {
    const room = areaWidthPx - TILE_SHEET_PADDING_PX;
    const fitting = TILE_ZOOMS.filter(
        (zoom) => zoom <= DEFAULT_TILE_ZOOM && sheetWidthPx * zoom <= room
    );
    return fitting.at(-1) ?? TILE_ZOOMS[0];
};
