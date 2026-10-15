import type { FootprintAsset } from "../types/footprint-asset";
import type { FootprintCell } from "../types/footprint-cell";
import { getOccupiedCells } from "./getOccupiedCells";

/** The cells an asset occupies when its footprint is anchored at the cell. */
export const occupiedCells = (
    asset: FootprintAsset,
    tileX: number,
    tileY: number
): FootprintCell[] =>
    getOccupiedCells({
        tileX,
        tileY,
        width: asset.footprint.w,
        height: asset.footprint.h,
        mask: asset.footprint.mask,
    });
