import {
    TILE_CATEGORIES,
    WALL_PIECES,
    WALL_PIECE_EDGES,
    type TileMeta,
    type WallPiece,
} from "@standin/contracts";

// The thin wall style "Azul": eight pieces on a sheet of 8 columns and 2 rows
// of 32 px tiles. The top row holds the cap of the six tall pieces (drawn on the
// cell above the wall) and the bottom row the base of every piece. The side
// pieces e and w are one tile and sit on the bottom row.
export const WALL_STYLE_NAME = "Azul";

const WALL_SHEET_BASE64 =
    "iVBORw0KGgoAAAANSUhEUgAAAQAAAABACAYAAAD1Xam+AAACW0lEQVR4nO3dsWpTURwG8FPpqotLB0EKRcSxYxCEPomjj+TokxQEydhRSgmUgkoHXewD1O2S5JabJuWee+L3+00N5Gvu8OeDm3Ny7kGBCb18d3b/4tVJOT6dlTdvT6a+nAhXl4tyfTEvf38syuHUFwPL5udfH/3eu9ub8vzo9c6flZifnX1Yef1s508H9p4CgGCH7sHqW74H+/P9/GDq6yFX7zuAq8vFFNcRQ8nSkl4B/P7189HhffwSZOq8AqAlvQK4u73Z6h9s+355hpi/uvleARyfzrq/ry/mK6+3Jf+0fCLzVze/8RZgm1uCh8iv5t0CDDN/4+bX588yIARTABBMAUAwBQDBFAAE27gPYOp1yvR8GvNXNz+4D2CTfVjnbDlPn/mrly/liVuBd3l/et4+gGHmb9y8fQBARwFAMAUAwRQABFMAEMx5ANb5m2L+6uadB9BwPpH5q5t3HkDlvH0Aw8zfuHn7AICOAoBgCgCCKQAIpgAgmPMAGs+nMX91884DmHidf/3ZjJ8/vv+vnxX46cu3++VnI64zf/XypTgPYPLfY7PK/I2btw8A6CgACKYAIJgCgGAKAII5D8A6f1PMX9288wAazicyf3XzzgOonLcPYJj5GzdvHwDQUQAQTAFAMAUAwRQABHMeQOP5NOavbt55ANb5m2L+6uVLcR7A5L/HZpX5GzdvHwDQUQAQTAFAMAUAwRQABHMegHX+ppi/unnnATScT2T+6uadB1A5bx/AMPM3bt4+AKCjACCYAoBgCgCC+Tlw4/k05q9uvlcADz2yGWoxf3X9AyWxYYIrStJSAAAAAElFTkSuQmCC";

export const WALL_SHEET_IMAGE = Buffer.from(WALL_SHEET_BASE64, "base64");

const COLUMNS: readonly WallPiece[] = [
    WALL_PIECES.NW,
    WALL_PIECES.N,
    WALL_PIECES.NE,
    WALL_PIECES.W,
    WALL_PIECES.E,
    WALL_PIECES.SW,
    WALL_PIECES.S,
    WALL_PIECES.SE,
];

const BASE_ROW_OFFSET = COLUMNS.length;

// The trace of a side piece is 4 px at the tile edge, which the 8 px cells of
// the collision mask hold as one column.
const SIDE_COLUMN_BY_PIECE: Partial<Record<WallPiece, number>> = {
    [WALL_PIECES.W]: 0,
    [WALL_PIECES.E]: 3,
};

const buildSideMask = (column: number): boolean[][] =>
    Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, (_, index) => index === column)
    );

const isSidePiece = (piece: WallPiece): boolean =>
    SIDE_COLUMN_BY_PIECE[piece] !== undefined;

export const WALL_SHEET_META: TileMeta = Object.fromEntries(
    COLUMNS.map((piece, column) => {
        const sideColumn = SIDE_COLUMN_BY_PIECE[piece];
        return [
            String(BASE_ROW_OFFSET + column),
            {
                category: TILE_CATEGORIES.WALL,
                // A side piece blocks through its collision mask only, so an
                // object can still stand next to the trace.
                ...(isSidePiece(piece) ? {} : { solid: true }),
                // The blank map draws its outline from this style.
                ...(piece === WALL_PIECES.N ? { blankDefault: true } : {}),
                style: WALL_STYLE_NAME,
                edges: [...WALL_PIECE_EDGES[piece]],
                ...(isSidePiece(piece) ? {} : { top: column }),
                ...(sideColumn === undefined
                    ? {}
                    : { solidMask: buildSideMask(sideColumn) }),
            },
        ];
    })
);
