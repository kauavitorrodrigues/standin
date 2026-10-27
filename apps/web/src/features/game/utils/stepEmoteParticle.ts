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
): EmoteParticleState => advanceEmoteParticle({ ...particle }, delta);

// The same frame, written into the particle itself, so the per-frame loop of
// the emitter builds no state object. Returns the particle it was given.
export const advanceEmoteParticle = (
    particle: EmoteParticleState,
    delta: number
): EmoteParticleState => {
    if (isEmoteParticleWaiting(particle)) {
        particle.delayMs -= delta;
        return particle;
    }

    const seconds = delta / MS_PER_SECOND;
    particle.ageMs += delta;
    particle.velocityY += EMOTE_PARTICLE.GRAVITY * seconds;
    particle.x += particle.velocityX * seconds;
    particle.y += particle.velocityY * seconds;
    return particle;
};

export const isEmoteParticleWaiting = (particle: EmoteParticleState): boolean =>
    particle.delayMs > 0;

export const isEmoteParticleDone = (particle: EmoteParticleState): boolean =>
    particle.ageMs >= particle.lifeMs;

// Fully visible when born, nothing when its life is over.
export const getEmoteParticleAlpha = (particle: EmoteParticleState): number =>
    FULL_ALPHA - particle.ageMs / particle.lifeMs;
