import { describe, expect, it } from "vitest";
import { CONFETTI_PIECE } from "@/features/game/consts/confetti";
import type { ConfettiPieceState } from "@/features/game/types/confetti";
import {
    advanceConfettiPiece,
    getConfettiPieceAlpha,
    getConfettiPieceScaleY,
    isConfettiPieceDone,
} from "../stepConfettiPiece";

const piece = (
    patch: Partial<ConfettiPieceState> = {}
): ConfettiPieceState => ({
    x: 0,
    y: 0,
    velocityX: 100,
    velocityY: -200,
    rotation: 0,
    spin: 2,
    flip: 0,
    flipSpeed: 10,
    colorIndex: 0,
    ageMs: 0,
    lifeMs: 1000,
    ...patch,
});

describe("advanceConfettiPiece", () => {
    it("moves the piece and ages it by the delta", () => {
        const next = advanceConfettiPiece(piece(), 100);

        expect(next.ageMs).toBe(100);
        expect(next.x).toBeGreaterThan(0);
        expect(next.y).toBeLessThan(0);
    });

    it("slows the burst down and lets gravity turn it into a fall", () => {
        const state = piece();
        for (let i = 0; i < 120; i += 1) advanceConfettiPiece(state, 16);

        expect(Math.abs(state.velocityX)).toBeLessThan(100);
        expect(state.velocityY).toBeGreaterThan(0);
    });

    it("never goes faster than gravity allows once it is falling", () => {
        const state = piece({ velocityY: 0, velocityX: 0 });
        for (let i = 0; i < 600; i += 1) advanceConfettiPiece(state, 16);

        // The speed where drag and gravity cancel, with a little room for the
        // frame steps of the integration.
        const terminal =
            CONFETTI_PIECE.GRAVITY / -Math.log(CONFETTI_PIECE.DRAG_PER_SECOND);
        expect(state.velocityY).toBeLessThanOrEqual(terminal * 1.02);
    });

    it("turns and flips the piece", () => {
        const next = advanceConfettiPiece(piece(), 500);

        expect(next.rotation).toBeCloseTo(1);
        expect(next.flip).toBeCloseTo(5);
    });
});

describe("confetti piece life", () => {
    it("is done once its age reaches its life", () => {
        expect(isConfettiPieceDone(piece({ ageMs: 999 }))).toBe(false);
        expect(isConfettiPieceDone(piece({ ageMs: 1000 }))).toBe(true);
    });

    it("stays opaque at first, then fades to nothing", () => {
        expect(getConfettiPieceAlpha(piece({ ageMs: 0 }))).toBe(1);
        expect(getConfettiPieceAlpha(piece({ ageMs: 600 }))).toBe(1);
        expect(getConfettiPieceAlpha(piece({ ageMs: 800 }))).toBeCloseTo(0.5);
        expect(getConfettiPieceAlpha(piece({ ageMs: 1000 }))).toBe(0);
    });

    it("squeezes like paper but never disappears", () => {
        expect(getConfettiPieceScaleY(piece({ flip: 0 }))).toBe(1);
        expect(
            getConfettiPieceScaleY(piece({ flip: Math.PI / 2 }))
        ).toBeGreaterThan(0);
    });
});
