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
    "REMOVED-ASSET";

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
