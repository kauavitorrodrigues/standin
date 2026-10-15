import type { CSSProperties } from "react";
import { TILE_SIZE } from "@standin/contracts";
import { GRID_LINE_COLOR } from "@/features/assets/consts/editorColors";
import type { TileZoom } from "../../consts/sheetZoom";
import type { TileSheetGrid } from "../../types/sheet";

// The lines between the cells of the sheet, as one gradient, so the grid costs
// nothing however many cells the sheet has. A line closes each cell, which
// leaves the spacing between cells (when there is any) free of lines.
export const getGridLineStyle = (
    grid: TileSheetGrid,
    zoom: TileZoom
): CSSProperties => {
    const side = TILE_SIZE * zoom;
    const step = (TILE_SIZE + grid.spacing) * zoom;
    const margin = grid.margin * zoom;
    const line = `transparent ${side - 1}px, ${GRID_LINE_COLOR} ${side - 1}px ${side}px, transparent ${side}px`;

    return {
        backgroundImage: `linear-gradient(to right, ${line}), linear-gradient(to bottom, ${line})`,
        backgroundSize: `${step}px ${step}px`,
        backgroundPosition: `${margin}px ${margin}px`,
    };
};
