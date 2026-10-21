import { EMOTE_PARTICLE } from "@/features/game/consts/emote";
import type { EmoteParticleState } from "@/features/game/types/emote";

const MS_PER_SECOND = 1000;
const FULL_ALPHA = 1;

// One frame of a floating emoji. While it waits for its turn it only counts
// the delay down. After that gravity pulls its speed down and it moves.
// `delta` is Phaser's per-frame delta in ms.
export const stepEmoteParticle = (
    particle: EmoteParticleState,
    delta: number
): EmoteParticleState => {
    if (isEmoteParticleWaiting(particle)) {
        return { ...particle, delayMs: particle.delayMs - delta };
    }

    const seconds = delta / MS_PER_SECOND;
    const velocityY = particle.velocityY + EMOTE_PARTICLE.GRAVITY * seconds;
    return {
        ...particle,
        ageMs: particle.ageMs + delta,
        velocityY,
        x: particle.x + particle.velocityX * seconds,
        y: particle.y + velocityY * seconds,
    };
};

export const isEmoteParticleWaiting = (particle: EmoteParticleState): boolean =>
    particle.delayMs > 0;

export const isEmoteParticleDone = (particle: EmoteParticleState): boolean =>
    particle.ageMs >= particle.lifeMs;

// Fully visible when born, nothing when its life is over.
export const getEmoteParticleAlpha = (particle: EmoteParticleState): number =>
    FULL_ALPHA - particle.ageMs / particle.lifeMs;
