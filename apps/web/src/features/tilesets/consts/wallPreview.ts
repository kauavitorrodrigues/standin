import { WALL_PIECES, type WallPiece } from "@standin/contracts";

// How big a tile is drawn in the preview, as a multiple of its 32 px.
export const WALL_PREVIEW_SCALE = 2;

// The room the preview builds out of the pieces. The caps of the tall pieces
// rise over the row above them, so the preview keeps one more row on top.
export const WALL_PREVIEW_COLUMNS = 7;
export const WALL_PREVIEW_ROWS = 5;

export type WallPreviewCell = { piece: WallPiece; column: number; row: number };

const LAST_COLUMN = WALL_PREVIEW_COLUMNS - 1;
const LAST_ROW = WALL_PREVIEW_ROWS - 1;

const pickByColumn = (
    column: number,
    first: WallPiece,
    middle: WallPiece,
    last: WallPiece
): WallPiece => {
    if (column === 0) return first;
    if (column === LAST_COLUMN) return last;
    return middle;
};

const buildOutline = (): WallPreviewCell[] => {
    const cells: WallPreviewCell[] = [];
    for (let column = 0; column < WALL_PREVIEW_COLUMNS; column += 1) {
        cells.push({
            column,
            row: 0,
            piece: pickByColumn(
                column,
                WALL_PIECES.NW,
                WALL_PIECES.N,
                WALL_PIECES.NE
            ),
        });
        cells.push({
            column,
            row: LAST_ROW,
            piece: pickByColumn(
                column,
                WALL_PIECES.SW,
                WALL_PIECES.S,
                WALL_PIECES.SE
            ),
        });
    }
    for (let row = 1; row < LAST_ROW; row += 1) {
        cells.push({ column: 0, row, piece: WALL_PIECES.W });
        cells.push({ column: LAST_COLUMN, row, piece: WALL_PIECES.E });
    }
    return cells;
};

export const WALL_PREVIEW_CELLS: readonly WallPreviewCell[] = buildOutline();
