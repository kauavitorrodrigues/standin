import { EMOTE_PARTICLE } from "@/features/game/consts/emote";

/**
 * How many floating particles the scene may hold at once, whoever spawned
 * them. One instance is shared by every emitter of the scene (the emoji
 * particles and the pixel emitter), so the cap is global and a flood from one
 * emitter cannot starve or grow the other. The per-user limit stays in
 * `EmoteRateLimiter`.
 */
export class ParticleBudget {
    private readonly limit: number;
    private used = 0;

    constructor(limit: number = EMOTE_PARTICLE.MAX_ACTIVE) {
        this.limit = limit;
    }

    get count(): number {
        return this.used;
    }

    // True and counted when there is room, false when the cap is reached.
    tryTake(): boolean {
        if (this.used >= this.limit) return false;

        this.used += 1;
        return true;
    }

    give(): void {
        this.used = Math.max(0, this.used - 1);
    }

    reset(): void {
        this.used = 0;
    }
}
