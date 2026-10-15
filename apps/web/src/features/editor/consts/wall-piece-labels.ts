import { WALL_PIECES, type WallPiece } from "@standin/contracts";

// How a wall piece is named for the person, by where it stands on a room.
export const WALL_PIECE_LABELS: Record<WallPiece, string> = {
    [WALL_PIECES.N]: "parede de fundo",
    [WALL_PIECES.NE]: "quina superior direita",
    [WALL_PIECES.E]: "lado direito",
    [WALL_PIECES.SE]: "quina inferior direita",
    [WALL_PIECES.S]: "parede da frente",
    [WALL_PIECES.SW]: "quina inferior esquerda",
    [WALL_PIECES.W]: "lado esquerdo",
    [WALL_PIECES.NW]: "quina superior esquerda",
};
