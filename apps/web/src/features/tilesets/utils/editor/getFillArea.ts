import type { TileMeta } from "@standin/contracts";
import type { TileSheetGrid } from "../../types/sheet";
import { getTileFloodFill } from "./getFloodFill";
import { getTilesOfSameCategory } from "./getSameCategory";

// What the bucket fills from a tile: the tiles that touch it with the same
// category, or all the tiles of the sheet that have it.
export const getFillArea = (
    meta: TileMeta,
    index: number,
    grid: TileSheetGrid,
    contiguous: boolean
): number[] => {
    if (contiguous) return getTileFloodFill(meta, index, grid);
    return getTilesOfSameCategory(meta, index, grid.tileCount);
};
