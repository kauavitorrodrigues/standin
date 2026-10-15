import { WALL_PIECES, type WallPiece } from "@standin/contracts";

// The columns of the sheet a wall style is built into, left to right. The top
// row of the sheet holds the cap of each tall piece and the bottom row the base
// of every piece, so a piece has the tile `column` as its cap and
// `columns + column` as its base. This is the same sheet the library seeds.
export const WALL_SHEET_ORDER: readonly WallPiece[] = [
    WALL_PIECES.NW,
    WALL_PIECES.N,
    WALL_PIECES.NE,
    WALL_PIECES.W,
    WALL_PIECES.E,
    WALL_PIECES.SW,
    WALL_PIECES.S,
    WALL_PIECES.SE,
];

export const WALL_SHEET_ROWS = 2;

// The most files the wall style form takes: the eight pieces.
export const WALL_STYLE_MAX_FILES = WALL_SHEET_ORDER.length;
