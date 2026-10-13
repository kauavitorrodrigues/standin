import type { LibraryTilesetDetail } from "@standin/contracts";
import type { TileSheetGrid } from "../../types/sheet";

// The grid of a tileset the library already has, from what it saved.
export const toTileSheetGrid = (
    tileset: LibraryTilesetDetail
): TileSheetGrid => ({
    columns: tileset.columns,
    rows: tileset.tileCount / tileset.columns,
    margin: tileset.margin,
    spacing: tileset.spacing,
    widthPx: tileset.widthPx,
    heightPx: tileset.heightPx,
    tileCount: tileset.tileCount,
});
