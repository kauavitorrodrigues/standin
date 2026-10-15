import {
    WALL_PIECES,
    WALL_PIECE_EDGES,
    type WallEdge,
    type WallPiece,
} from "../enums/wall-edge";

const PIECES = Object.values(WALL_PIECES) as WallPiece[];

// The piece that draws exactly these edges, whatever the order they come in,
// or null when the set is not one of the eight a style is made of (opposite
// edges, three edges, four edges, none or a repeated one).
export const getWallPiece = (edges: readonly WallEdge[]): WallPiece | null => {
    if (new Set(edges).size !== edges.length) return null;

    return (
        PIECES.find((piece) => {
            const own = WALL_PIECE_EDGES[piece];
            return (
                own.length === edges.length &&
                own.every((edge) => edges.includes(edge))
            );
        }) ?? null
    );
};

export const getWallPieceEdges = (piece: WallPiece): readonly WallEdge[] =>
    WALL_PIECE_EDGES[piece];

export const isWallPiece = (value: string): value is WallPiece =>
    PIECES.some((piece) => piece === value);

export const ALL_WALL_PIECES: readonly WallPiece[] = PIECES;
