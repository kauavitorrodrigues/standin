import { describe, expect, it } from "vitest";
import { EMOTE_PARTICLE } from "@/features/game/consts/emote";
import { buildEmoteMotions } from "../buildEmoteMotions";

const LOWEST = () => 0;
const HIGHEST = () => 1;

describe("buildEmoteMotions", () => {
    it("makes one motion per emoji of the combo", () => {
        const motions = buildEmoteMotions({
            count: 3,
            isReducedMotion: false,
            random: LOWEST,
        });

        expect(motions).toHaveLength(3);
    });

    it("staggers the emojis one after the other", () => {
        const motions = buildEmoteMotions({
            count: 3,
            isReducedMotion: false,
            random: LOWEST,
        });

        expect(motions.map((motion) => motion.delayMs)).toEqual([
            0,
            EMOTE_PARTICLE.STAGGER_MS,
            EMOTE_PARTICLE.STAGGER_MS * 2,
        ]);
    });

    it("keeps speeds and life inside their ranges, always rising", () => {
        for (const random of [LOWEST, HIGHEST]) {
            const [motion] = buildEmoteMotions({
                count: 1,
                isReducedMotion: false,
                random,
            });

            expect(Math.abs(motion.velocityX)).toBeLessThanOrEqual(
                EMOTE_PARTICLE.SPEED_X_MAX
            );
            expect(motion.velocityY).toBeLessThanOrEqual(
                -EMOTE_PARTICLE.SPEED_Y_MIN
            );
            expect(motion.velocityY).toBeGreaterThanOrEqual(
                -EMOTE_PARTICLE.SPEED_Y_MAX
            );
            expect(motion.lifeMs).toBeGreaterThanOrEqual(
                EMOTE_PARTICLE.LIFE_MIN_MS
            );
            expect(motion.lifeMs).toBeLessThanOrEqual(
                EMOTE_PARTICLE.LIFE_MAX_MS
            );
        }
    });

    it("makes a single emoji that stays still with reduced motion", () => {
        const motions = buildEmoteMotions({
            count: 4,
            isReducedMotion: true,
            random: LOWEST,
        });

        expect(motions).toEqual([
            {
                velocityX: 0,
                velocityY: 0,
                delayMs: 0,
                lifeMs: EMOTE_PARTICLE.REDUCED_MOTION_LIFE_MS,
            },
        ]);
    });
});
