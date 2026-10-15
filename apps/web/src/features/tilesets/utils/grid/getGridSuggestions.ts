import type { ImageSize } from "@/features/assets/queries/useImageSize";
import type { GridSuggestion } from "../../types/sheet";
import { getTilesetGrid } from "./getGrid";

// The largest margin and spacing tried. A sheet with more than this around its
// tiles is not a sheet to guess for.
const MAX_GAP_PX = 31;
const MAX_SUGGESTIONS = 5;

// Every margin and spacing that cut the image into an exact number of cells,
// the plainest first (the least margin and spacing), and no more than a few.
// The tile is always 32 px, so there are few ways for a sheet to fit.
export const getGridSuggestions = (size: ImageSize): GridSuggestion[] => {
    const found: GridSuggestion[] = [];
    for (let margin = 0; margin <= MAX_GAP_PX; margin++) {
        for (let spacing = 0; spacing <= MAX_GAP_PX; spacing++) {
            const grid = getTilesetGrid(size, margin, spacing);
            if (!grid) continue;
            found.push({
                margin,
                spacing,
                columns: grid.columns,
                rows: grid.rows,
            });
        }
    }
    return found
        .sort((a, b) => a.margin + a.spacing - (b.margin + b.spacing))
        .slice(0, MAX_SUGGESTIONS);
};
