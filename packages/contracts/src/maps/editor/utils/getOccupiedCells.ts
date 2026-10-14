import type { Footprint } from "../types/footprint";
import type { FootprintCell } from "../types/footprint-cell";
import { getFootprintCells } from "./getFootprintCells";

/**
 * The cells of the footprint the object occupies. Without a mask it is every
 * cell of the rectangle. With one, the mask rows go from the top of the
 * rectangle to its bottom, the same order as the sprite.
 */
export const getOccupiedCells = (footprint: Footprint): FootprintCell[] => {
    const { mask, tileY, height } = footprint;
    const cells = getFootprintCells(footprint);
    if (!mask) return cells;

    const top = tileY - height + 1;
    return cells.filter(({ x, y }) => mask[y - top]?.[x - footprint.tileX]);
};
