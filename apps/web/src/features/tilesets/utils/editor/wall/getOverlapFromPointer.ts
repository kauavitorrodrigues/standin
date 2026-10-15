import { TILE_SIZE, WALL_OVERLAP_MAX } from "@standin/contracts";

// The rows of the tile that are over the line the pointer is on, from its
// height inside the tile as drawn. A pointer above or below the tile is the
// first or the last row.
export const getOverlapFromPointer = (
    offsetY: number,
    drawnHeightPx: number
): number => {
    if (drawnHeightPx <= 0) return 0;
    const rows = Math.round((offsetY / drawnHeightPx) * TILE_SIZE);
    return Math.min(WALL_OVERLAP_MAX, Math.max(0, rows));
};
