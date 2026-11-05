import {
    CONFETTI_COLORS,
    CONFETTI_PIECE,
} from "@/features/game/consts/confetti";
import type { ConfettiPieceState } from "@/features/game/types/confetti";
import { randomBetween } from "@/features/game/utils/randomBetween";

const STRAIGHT_UP = -Math.PI / 2;
const NO_AGE = 0;

type Params = {
    x: number;
    y: number;
    isReducedMotion: boolean;
    random: () => number;
};

// The pieces of one burst. They leave the same point in a fan around the
// vertical, each with its own speed, spin and color. With reduced motion there
// is no burst at all, since the whole effect is movement.
export const buildConfettiPieces = ({
    x,
    y,
    isReducedMotion,
    random,
}: Params): ConfettiPieceState[] => {
    if (isReducedMotion) return [];

    const half = CONFETTI_PIECE.SPREAD_RAD / 2;
    return Array.from({ length: CONFETTI_PIECE.PER_BURST }, () => {
        const angle = STRAIGHT_UP + randomBetween(-half, half, random);
        const speed = randomBetween(
            CONFETTI_PIECE.SPEED_MIN,
            CONFETTI_PIECE.SPEED_MAX,
            random
        );
        return {
            x,
            y,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            rotation: randomBetween(0, Math.PI * 2, random),
            spin: randomBetween(
                -CONFETTI_PIECE.SPIN_MAX_RAD,
                CONFETTI_PIECE.SPIN_MAX_RAD,
                random
            ),
            flip: randomBetween(0, Math.PI * 2, random),
            flipSpeed: randomBetween(
                CONFETTI_PIECE.FLIP_RAD_PER_SECOND_MIN,
                CONFETTI_PIECE.FLIP_RAD_PER_SECOND_MAX,
                random
            ),
            colorIndex: Math.floor(random() * CONFETTI_COLORS.length),
            ageMs: NO_AGE,
            lifeMs: randomBetween(
                CONFETTI_PIECE.LIFE_MIN_MS,
                CONFETTI_PIECE.LIFE_MAX_MS,
                random
            ),
        };
    });
};
