import type { TileMeta } from "@standin/contracts";
import type { TileSheetGrid, TileTool } from "../../types/sheet";
import { getFillArea } from "./getFillArea";
import { getTileFloodFill } from "./getFloodFill";
import { getTilesOfSameCategory } from "./getSameCategory";

type Params = {
    tool: TileTool;
    hovered: number | null;
    meta: TileMeta;
    grid: TileSheetGrid;
    // Whether the bucket fills only what touches the tile.
    contiguous: boolean;
};

// The tiles a click would touch with a tool that works on an area, for the
// sheet to outline them before the click. The other tools touch what the
// pointer is over, which is already outlined.
export const getToolPreview = ({
    tool,
    hovered,
    meta,
    grid,
    contiguous,
}: Params): number[] => {
    if (hovered === null) return [];
    switch (tool) {
        case "bucket":
            return getFillArea(meta, hovered, grid, contiguous);
        case "wand":
            return getTileFloodFill(meta, hovered, grid);
        case "same":
            return getTilesOfSameCategory(meta, hovered, grid.tileCount);
        default:
            return [];
    }
};
