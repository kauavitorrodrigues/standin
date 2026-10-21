import { EMOTE_PARTICLE } from "@/features/game/consts/emote";
import type { EmoteParticleMotion } from "@/features/game/types/emote";
import { randomBetween } from "@/features/game/utils/randomBetween";

const NO_SPEED = 0;
const NO_DELAY = 0;

type Params = {
    count: number;
    isReducedMotion: boolean;
    random: () => number;
};

// How each emoji of one emote moves. They rise with a little drift and come
// one after the other, so a combo reads as a burst. With reduced motion there
// is one emoji that stays where it is and only fades.
export const buildEmoteMotions = ({
    count,
    isReducedMotion,
    random,
}: Params): EmoteParticleMotion[] => {
    if (isReducedMotion) {
        return [
            {
                velocityX: NO_SPEED,
                velocityY: NO_SPEED,
                delayMs: NO_DELAY,
                lifeMs: EMOTE_PARTICLE.REDUCED_MOTION_LIFE_MS,
            },
        ];
    }

    return Array.from({ length: count }, (_, index) => ({
        velocityX: randomBetween(
            -EMOTE_PARTICLE.SPEED_X_MAX,
            EMOTE_PARTICLE.SPEED_X_MAX,
            random
        ),
        velocityY: -randomBetween(
            EMOTE_PARTICLE.SPEED_Y_MIN,
            EMOTE_PARTICLE.SPEED_Y_MAX,
            random
        ),
        delayMs: index * EMOTE_PARTICLE.STAGGER_MS,
        lifeMs: randomBetween(
            EMOTE_PARTICLE.LIFE_MIN_MS,
            EMOTE_PARTICLE.LIFE_MAX_MS,
            random
        ),
    }));
};
