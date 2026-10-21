import { describe, expect, it } from "vitest";
import { EMOTE_PARTICLE } from "@/features/game/consts/emote";
import type { EmoteParticleState } from "@/features/game/types/emote";
import {
    getEmoteParticleAlpha,
    isEmoteParticleDone,
    isEmoteParticleWaiting,
    stepEmoteParticle,
} from "../stepEmoteParticle";

const FRAME_MS = 100;

const particle = (
    overrides: Partial<EmoteParticleState> = {}
): EmoteParticleState => ({
    x: 0,
    y: 0,
    velocityX: 10,
    velocityY: -60,
    delayMs: 0,
    ageMs: 0,
    lifeMs: 1000,
    ...overrides,
});

describe("stepEmoteParticle", () => {
    it("only counts the delay down while it waits", () => {
        const next = stepEmoteParticle(particle({ delayMs: 250 }), FRAME_MS);

        expect(next).toEqual(particle({ delayMs: 150 }));
        expect(isEmoteParticleWaiting(next)).toBe(true);
    });

    it("moves by its speed, with gravity slowing the rise", () => {
        const next = stepEmoteParticle(particle(), FRAME_MS);
        const seconds = FRAME_MS / 1000;
        const velocityY = -60 + EMOTE_PARTICLE.GRAVITY * seconds;

        expect(next.x).toBeCloseTo(10 * seconds);
        expect(next.velocityY).toBeCloseTo(velocityY);
        expect(next.y).toBeCloseTo(velocityY * seconds);
        expect(next.ageMs).toBe(FRAME_MS);
    });

    it("does not change the particle it is given", () => {
        const before = particle();

        stepEmoteParticle(before, FRAME_MS);

        expect(before).toEqual(particle());
    });
});

describe("emote particle life", () => {
    it("is done when its age reaches its life", () => {
        expect(isEmoteParticleDone(particle({ ageMs: 999 }))).toBe(false);
        expect(isEmoteParticleDone(particle({ ageMs: 1000 }))).toBe(true);
    });

    it("fades from full to nothing over its life", () => {
        expect(getEmoteParticleAlpha(particle({ ageMs: 0 }))).toBe(1);
        expect(getEmoteParticleAlpha(particle({ ageMs: 500 }))).toBe(0.5);
        expect(getEmoteParticleAlpha(particle({ ageMs: 1000 }))).toBe(0);
    });
});
