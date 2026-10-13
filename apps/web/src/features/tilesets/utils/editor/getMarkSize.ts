import { TILE_MARK_DIVISOR, TILE_MARK_MIN_PX } from "../../consts/sheetStyle";

// The side of the marks on a tile, from the side of the tile on screen.
export const getTileMarkSize = (tileSidePx: number): number =>
    Math.max(tileSidePx / TILE_MARK_DIVISOR, TILE_MARK_MIN_PX);
