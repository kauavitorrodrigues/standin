import { TILE_SIZE } from "@standin/contracts";
import type { TileSheetGrid } from "../../types/sheet";

type Point = { x: number; y: number };

// The tile under a point of the image, in px. A point on the margin or the
// spacing counts for the closest tile, so a drag never loses its hold.
export const getTileAt = (point: Point, grid: TileSheetGrid): number => {
    const step = TILE_SIZE + grid.spacing;
    const col = Math.floor((point.x - grid.margin) / step);
    const row = Math.floor((point.y - grid.margin) / step);
    const clampedCol = Math.min(Math.max(col, 0), grid.columns - 1);
    const clampedRow = Math.min(Math.max(row, 0), grid.rows - 1);
    return clampedRow * grid.columns + clampedCol;
};

// Every tile of the rectangle between two tiles.
export const getTileRect = (
    from: number,
    to: number,
    columns: number
): number[] => {
    const left = Math.min(from % columns, to % columns);
    const right = Math.max(from % columns, to % columns);
    const top = Math.min(Math.floor(from / columns), Math.floor(to / columns));
    const bottom = Math.max(
        Math.floor(from / columns),
        Math.floor(to / columns)
    );
    const tiles: number[] = [];
    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            tiles.push(row * columns + col);
        }
    }
    return tiles;
};
