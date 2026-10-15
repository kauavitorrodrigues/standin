import { WALL_PIECES, type WallPiece } from "../../../assets/enums/wall-edge";
import { cellKey } from "../readWallCells";

export const WALL_SHAPE_REASONS = {
    // Three or four neighbors: a junction, which no piece draws.
    JUNCTION: "junction",
    // A straight run whose two ends turn to opposite sides, such as an S or the
    // inner corner of an L, which no piece draws.
    MIXED_RUN: "mixed-run",
} as const;

export type WallShapeReason =
    (typeof WALL_SHAPE_REASONS)[keyof typeof WALL_SHAPE_REASONS];

export type WallPieceResult =
    { ok: true; piece: WallPiece } | { ok: false; reason: WallShapeReason };

type Neighbors = {
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
};

const getNeighbors = (
    cells: ReadonlySet<string>,
    column: number,
    row: number
): Neighbors => ({
    north: cells.has(cellKey(column, row - 1)),
    east: cells.has(cellKey(column + 1, row)),
    south: cells.has(cellKey(column, row + 1)),
    west: cells.has(cellKey(column - 1, row)),
});

const count = (neighbors: Neighbors): number =>
    Number(neighbors.north) +
    Number(neighbors.east) +
    Number(neighbors.south) +
    Number(neighbors.west);

// The piece of a corner, from the two sides its walls go to. A wall going
// east and south makes the top left corner of an outline, and so on.
const pickCorner = (neighbors: Neighbors): WallPiece => {
    if (neighbors.east && neighbors.south) return WALL_PIECES.NW;
    if (neighbors.west && neighbors.south) return WALL_PIECES.NE;
    if (neighbors.east && neighbors.north) return WALL_PIECES.SW;
    return WALL_PIECES.SE;
};

// How far along a direction the run of walls goes, to the cell that ends it.
const walk = (
    cells: ReadonlySet<string>,
    column: number,
    row: number,
    stepColumn: number,
    stepRow: number
): { column: number; row: number } => {
    let current = { column, row };
    while (
        cells.has(cellKey(current.column + stepColumn, current.row + stepRow))
    ) {
        current = {
            column: current.column + stepColumn,
            row: current.row + stepRow,
        };
    }
    return current;
};

// A row of wall is the back wall (n) when its ends turn down, the front wall
// (s) when they turn up, and the front wall when it does not turn at all.
const pickHorizontal = (
    cells: ReadonlySet<string>,
    column: number,
    row: number
): WallPieceResult => {
    const left = walk(cells, column, row, -1, 0);
    const right = walk(cells, column, row, 1, 0);
    const ends = [left, right].map((end) =>
        getNeighbors(cells, end.column, end.row)
    );
    const turnsDown = ends.some((end) => end.south);
    const turnsUp = ends.some((end) => end.north);

    if (turnsDown && turnsUp) {
        return { ok: false, reason: WALL_SHAPE_REASONS.MIXED_RUN };
    }
    if (turnsDown) return { ok: true, piece: WALL_PIECES.N };
    return { ok: true, piece: WALL_PIECES.S };
};

// A column of wall is the left wall (w) when its ends turn right, the right
// wall (e) when they turn left, and the right wall when it does not turn.
const pickVertical = (
    cells: ReadonlySet<string>,
    column: number,
    row: number
): WallPieceResult => {
    const top = walk(cells, column, row, 0, -1);
    const bottom = walk(cells, column, row, 0, 1);
    const ends = [top, bottom].map((end) =>
        getNeighbors(cells, end.column, end.row)
    );
    const turnsRight = ends.some((end) => end.east);
    const turnsLeft = ends.some((end) => end.west);

    if (turnsRight && turnsLeft) {
        return { ok: false, reason: WALL_SHAPE_REASONS.MIXED_RUN };
    }
    if (turnsRight) return { ok: true, piece: WALL_PIECES.W };
    return { ok: true, piece: WALL_PIECES.E };
};

/**
 * The piece a wall cell of a style takes from the cells of that style around
 * it. The set covers outlines of rectangles and straight lines: a cell with
 * three or four neighbors, or a run whose ends turn to opposite sides (which is
 * where an inner corner shows up), has no piece and is refused. A line that
 * ends in the air keeps the piece of its run, cut at the end.
 */
export const pickWallPiece = (
    cells: ReadonlySet<string>,
    column: number,
    row: number
): WallPieceResult => {
    const neighbors = getNeighbors(cells, column, row);

    switch (count(neighbors)) {
        case 0:
            return { ok: true, piece: WALL_PIECES.E };
        case 1:
            return neighbors.east || neighbors.west
                ? pickHorizontal(cells, column, row)
                : pickVertical(cells, column, row);
        case 2:
            if (neighbors.north && neighbors.south) {
                return pickVertical(cells, column, row);
            }
            if (neighbors.east && neighbors.west) {
                return pickHorizontal(cells, column, row);
            }
            return { ok: true, piece: pickCorner(neighbors) };
        default:
            return { ok: false, reason: WALL_SHAPE_REASONS.JUNCTION };
    }
};
