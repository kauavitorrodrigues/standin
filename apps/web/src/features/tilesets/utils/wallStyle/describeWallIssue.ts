import type { WallPiece } from "@standin/contracts";
import { WALL_PIECE_LABELS } from "../../consts/wall";
import { WALL_STYLE_ISSUES, type WallStyleIssue } from "./buildWallSheet";
import { getPieceHeightTiles } from "./getPieceHeightTiles";

const SIZE_LABELS: Record<number, string> = {
    1: "32 x 32 px",
    2: "32 x 64 px",
};

const describeSize = (piece: WallPiece): string =>
    SIZE_LABELS[getPieceHeightTiles(piece)];

// One sentence for a piece that stops the style from being built.
export const describeWallIssue = ({ piece, kind }: WallStyleIssue): string => {
    const label = WALL_PIECE_LABELS[piece];
    switch (kind) {
        case WALL_STYLE_ISSUES.MISSING:
            return `Falta a peça ${label}.`;
        case WALL_STYLE_ISSUES.SIZE:
            return `A peça ${label} precisa ter ${describeSize(piece)}.`;
        case WALL_STYLE_ISSUES.EMPTY:
            return `A peça ${label} está transparente.`;
    }
};
