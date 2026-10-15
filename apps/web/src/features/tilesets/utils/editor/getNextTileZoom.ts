import { TILE_ZOOMS, type TileZoom } from "../../consts/sheetZoom";

// The zoom one step in (1) or out (-1), stopping at the ends.
export const getNextTileZoom = (
    zoom: TileZoom,
    direction: 1 | -1
): TileZoom => {
    const index = TILE_ZOOMS.indexOf(zoom) + direction;
    const clamped = Math.min(Math.max(index, 0), TILE_ZOOMS.length - 1);
    return TILE_ZOOMS[clamped]!;
};
