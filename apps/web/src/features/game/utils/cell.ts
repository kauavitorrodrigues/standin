import { TILE_SIZE } from "@standin/contracts";
import type { Cell } from "@/features/game/types/cell";

type Point = { x: number; y: number };

// The point, in px, in the middle of the tile.
export const getCellCenter = ({ column, row }: Cell): Point => ({
    x: (column + 0.5) * TILE_SIZE,
    y: (row + 0.5) * TILE_SIZE,
});

// The tile that holds the point, in px.
export const getCellAt = (point: Point): Cell => ({
    column: Math.floor(point.x / TILE_SIZE),
    row: Math.floor(point.y / TILE_SIZE),
});

// Two tiles are the same when their column and row match. No tile (null) is
// the same as no tile.
export const isSameCell = (a: Cell | null, b: Cell | null): boolean =>
    a?.column === b?.column && a?.row === b?.row;
