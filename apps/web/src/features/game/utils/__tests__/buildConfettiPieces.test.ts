import { describe, expect, it } from "vitest";
import {
    CONFETTI_COLORS,
    CONFETTI_PIECE,
} from "@/features/game/consts/confetti";
import { buildConfettiPieces } from "../buildConfettiPieces";

const build = (random: () => number, isReducedMotion = false) =>
    buildConfettiPieces({ x: 10, y: 20, isReducedMotion, random });

describe("buildConfettiPieces", () => {
    it("makes one burst of pieces that all start at the same point", () => {
        const pieces = build(Math.random);

        expect(pieces).toHaveLength(CONFETTI_PIECE.PER_BURST);
        pieces.forEach((piece) => {
            expect(piece.x).toBe(10);
            expect(piece.y).toBe(20);
            expect(piece.ageMs).toBe(0);
        });
    });

    it("throws every piece upward, inside the fan", () => {
        const slope = Math.tan(CONFETTI_PIECE.SPREAD_RAD / 2);

        build(Math.random).forEach((piece) => {
            expect(piece.velocityY).toBeLessThan(0);
            expect(Math.abs(piece.velocityX)).toBeLessThanOrEqual(
                Math.abs(piece.velocityY) * slope + 1e-6
            );
        });
    });

    it("keeps speed, life and color inside their ranges", () => {
        build(Math.random).forEach((piece) => {
            const speed = Math.hypot(piece.velocityX, piece.velocityY);
            expect(speed).toBeGreaterThanOrEqual(
                CONFETTI_PIECE.SPEED_MIN - 1e-6
            );
            expect(speed).toBeLessThanOrEqual(CONFETTI_PIECE.SPEED_MAX + 1e-6);
            expect(piece.lifeMs).toBeGreaterThanOrEqual(
                CONFETTI_PIECE.LIFE_MIN_MS
            );
            expect(piece.lifeMs).toBeLessThanOrEqual(
                CONFETTI_PIECE.LIFE_MAX_MS
            );
            expect(piece.colorIndex).toBeGreaterThanOrEqual(0);
            expect(piece.colorIndex).toBeLessThan(CONFETTI_COLORS.length);
        });
    });

    it("never picks a color past the list when the random source returns 1", () => {
        build(() => 0.999999).forEach((piece) =>
            expect(piece.colorIndex).toBe(CONFETTI_COLORS.length - 1)
        );
    });

    it("throws nothing with reduced motion", () => {
        expect(build(Math.random, true)).toEqual([]);
    });
});
