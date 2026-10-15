import { WALL_COLLISION_CELLS } from "../../../consts/wall";
import type { WallCell } from "./paintWallCollision";

// The cell of the collision grid under the pointer, from where it is inside
// the tile as drawn. A pointer outside is taken to the nearest cell, so a
// stroke that leaves the tile has no gap.
export const getWallCellFromPointer = (
    offsetX: number,
    offsetY: number,
    drawnSizePx: number
): WallCell => {
    const side = drawnSizePx / WALL_COLLISION_CELLS;
    const clamp = (value: number) =>
        Math.min(WALL_COLLISION_CELLS - 1, Math.max(0, Math.floor(value)));
    return { col: clamp(offsetX / side), row: clamp(offsetY / side) };
};
