import { TILE_SIZE } from "@standin/contracts";
import type { PlacedRect } from "@/features/game/utils/placed";

// The rectangles, in px, a wall tile blocks at a cell, or null when the cell
// has no wall tile that blocks.
export type WallRectsAt = (column: number, row: number) => PlacedRect[] | null;

type Cell = { column: number; row: number };

// The cells just around the footprint, on the side the wall runs along.
const getNeighbors = (
    first: Cell,
    last: Cell
): { cell: Cell; along: "column" | "row" }[] => {
    const neighbors: { cell: Cell; along: "column" | "row" }[] = [];
    for (let row = first.row; row <= last.row; row++) {
        neighbors.push({
            cell: { column: first.column - 1, row },
            along: "row",
        });
        neighbors.push({
            cell: { column: last.column + 1, row },
            along: "row",
        });
    }
    for (let column = first.column; column <= last.column; column++) {
        neighbors.push({
            cell: { column, row: first.row - 1 },
            along: "column",
        });
        neighbors.push({
            cell: { column, row: last.row + 1 },
            along: "column",
        });
    }
    return neighbors;
};

/**
 * The rectangles a locked door blocks: the trace of the wall beside it, carried
 * across the gap. A door stands in a gap of a wall made of thin pieces, and what
 * blocks the way is the line of the leaf, not the whole cell, so an avatar next
 * to the wall inside the same cell is not caught when the room locks. The
 * trace is taken from the first wall tile that touches the footprint, and it is
 * repeated on every cell of the footprint. Null when no wall tile touches it,
 * and the door then blocks its whole footprint as it always did.
 */
export const buildDoorSolidRects = (
    door: PlacedRect,
    wallRectsAt: WallRectsAt
): PlacedRect[] | null => {
    const first: Cell = {
        column: Math.floor(door.x / TILE_SIZE),
        row: Math.floor(door.y / TILE_SIZE),
    };
    const last: Cell = {
        column: Math.ceil((door.x + door.width) / TILE_SIZE) - 1,
        row: Math.ceil((door.y + door.height) / TILE_SIZE) - 1,
    };

    for (const { cell } of getNeighbors(first, last)) {
        const rects = wallRectsAt(cell.column, cell.row);
        if (!rects || rects.length === 0) continue;

        const relative = rects.map((rect) => ({
            x: rect.x - cell.column * TILE_SIZE,
            y: rect.y - cell.row * TILE_SIZE,
            width: rect.width,
            height: rect.height,
        }));
        const cells: Cell[] = [];
        for (let row = first.row; row <= last.row; row++) {
            for (let column = first.column; column <= last.column; column++) {
                cells.push({ column, row });
            }
        }

        return cells.flatMap(({ column, row }) =>
            relative.map((rect) => ({
                x: column * TILE_SIZE + rect.x,
                y: row * TILE_SIZE + rect.y,
                width: rect.width,
                height: rect.height,
            }))
        );
    }

    return null;
};
