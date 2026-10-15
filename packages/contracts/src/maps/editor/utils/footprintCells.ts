import type { FootprintAsset } from "../types/footprint-asset";
import type { FootprintCell } from "../types/footprint-cell";
import { getFootprintCells } from "./getFootprintCells";

export const footprintCells = (
    asset: FootprintAsset,
    tileX: number,
    tileY: number
): FootprintCell[] =>
    getFootprintCells({
        tileX,
        tileY,
        width: asset.footprint.w,
        height: asset.footprint.h,
    });
