import {
    LAYOUT_LAYER_NAMES,
    MAX_CELLS_PER_OP,
    chunkCells,
    rectCells,
} from "@standin/contracts";
import type { EditorOp } from "@standin/contracts";

// Paints the ground under a room, in blocks of at most MAX_CELLS_PER_OP cells.
export const buildFloorOps = (
    tilesetId: string,
    tileIndex: number,
    {
        x,
        y,
        width,
        height,
    }: { x: number; y: number; width: number; height: number }
): EditorOp[] =>
    chunkCells(
        rectCells([x, y], [x + width - 1, y + height - 1]),
        MAX_CELLS_PER_OP
    ).map((cells) => ({
        type: "paint",
        layer: LAYOUT_LAYER_NAMES.GROUND,
        tilesetId,
        tileIndex,
        cells,
    }));
