import type { FootprintTile, SolidCell } from "../types/footprintMask";

// A pointer over a tile that a click can free or occupy, or over a cell that
// can be painted, crosshair anywhere else, where a drag marks the crop or the
// footprint.
export const getCanvasCursor = (
    hoveredTile: FootprintTile | null,
    hoveredCell: SolidCell | null = null
): string => {
    if (hoveredCell) return "cursor-cell";
    if (hoveredTile) return "cursor-pointer";
    return "cursor-crosshair";
};
