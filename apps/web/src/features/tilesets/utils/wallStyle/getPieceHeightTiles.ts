import { WALL_PIECES, type WallPiece } from "@standin/contracts";

// How tall the image of a piece is, in tiles. The two side pieces are one tile,
// the others are a cap over a base.
export const getPieceHeightTiles = (piece: WallPiece): number => {
    switch (piece) {
        case WALL_PIECES.E:
        case WALL_PIECES.W:
            return 1;
        default:
            return 2;
    }
};
