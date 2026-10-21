import { EMOTE_RATE_LIMIT } from "@/features/game/consts/emote";

type RateLimit = { MAX_EVENTS: number; WINDOW_MS: number };

/**
 * How many emotes each peer may send in a window. A peer that goes over has
 * the rest dropped, so it cannot fill the screen or the texture cache. The
 * nearby messages use the same rule with a limit of their own.
 */
export class EmoteRateLimiter {
    private readonly receivedAt = new Map<string, number[]>();
    private readonly limit: RateLimit;

    constructor(limit: RateLimit = EMOTE_RATE_LIMIT) {
        this.limit = limit;
    }

    // `now` is the scene time in ms. Counts the emote when it is allowed.
    allow(socketId: string, now: number): boolean {
        const { MAX_EVENTS, WINDOW_MS } = this.limit;
        const recent = (this.receivedAt.get(socketId) ?? []).filter(
            (at) => now - at < WINDOW_MS
        );
        if (recent.length >= MAX_EVENTS) {
            this.receivedAt.set(socketId, recent);
            return false;
        }

        this.receivedAt.set(socketId, [...recent, now]);
        return true;
    }

    remove(socketId: string): void {
        this.receivedAt.delete(socketId);
    }

    clear(): void {
        this.receivedAt.clear();
    }
}
