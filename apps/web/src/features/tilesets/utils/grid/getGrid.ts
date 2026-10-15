import { countTiles } from "@standin/contracts";
import type { ImageSize } from "@/features/assets/queries/useImageSize";
import type { TileSheetGrid } from "../../types/sheet";

// The grid of a sheet from its size, margin and spacing, the same way the
// server reads it. Null when the image is not an exact number of 32 px cells
// with that margin and spacing.
export const getTilesetGrid = (
    size: ImageSize,
    margin: number,
    spacing: number
): TileSheetGrid | null => {
    const columns = countTiles(size.w, margin, spacing);
    const rows = countTiles(size.h, margin, spacing);
    if (columns === null || rows === null) return null;
    return {
        columns,
        rows,
        margin,
        spacing,
        widthPx: size.w,
        heightPx: size.h,
        tileCount: columns * rows,
    };
};
