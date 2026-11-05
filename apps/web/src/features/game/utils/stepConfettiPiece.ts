import { CONFETTI_PIECE } from "@/features/game/consts/confetti";
import type { ConfettiPieceState } from "@/features/game/types/confetti";

const MS_PER_SECOND = 1000;
const FULL_ALPHA = 1;
const FLAT_SCALE = 0.15;

// One frame of a piece, written into the piece itself so the per-frame loop
// builds no objects. Drag slows the burst down, gravity then pulls it to the
// ground. `delta` is Phaser's per-frame delta in ms.
export const advanceConfettiPiece = (
    piece: ConfettiPieceState,
    delta: number
): ConfettiPieceState => {
    const seconds = delta / MS_PER_SECOND;
    const drag = Math.pow(CONFETTI_PIECE.DRAG_PER_SECOND, seconds);
    piece.ageMs += delta;
    piece.velocityX *= drag;
    piece.velocityY = piece.velocityY * drag + CONFETTI_PIECE.GRAVITY * seconds;
    piece.x += piece.velocityX * seconds;
    piece.y += piece.velocityY * seconds;
    piece.rotation += piece.spin * seconds;
    piece.flip += piece.flipSpeed * seconds;
    return piece;
};

export const isConfettiPieceDone = (piece: ConfettiPieceState): boolean =>
    piece.ageMs >= piece.lifeMs;

// Fully visible for most of its life, then it fades out.
export const getConfettiPieceAlpha = (piece: ConfettiPieceState): number => {
    const share = piece.ageMs / piece.lifeMs;
    if (share <= CONFETTI_PIECE.FADE_START_SHARE) return FULL_ALPHA;

    const fading =
        (share - CONFETTI_PIECE.FADE_START_SHARE) /
        (FULL_ALPHA - CONFETTI_PIECE.FADE_START_SHARE);
    return Math.max(0, FULL_ALPHA - fading);
};

// The height of the piece as it turns like paper: thin on its edge, full when
// it faces the camera, never fully gone.
export const getConfettiPieceScaleY = (piece: ConfettiPieceState): number =>
    Math.max(FLAT_SCALE, Math.abs(Math.cos(piece.flip)));
