import type { SolidCell } from "../types/footprintMask";

// A cell cursor over a cell that can be painted, crosshair anywhere else,
// where a drag marks the crop or the footprint.
export const getCanvasCursor = (hoveredCell: SolidCell | null): string => {
    if (hoveredCell) return "cursor-cell";
    return "cursor-crosshair";
};
