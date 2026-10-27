export type RateLimit = {
    // Events let through every second once the burst is used.
    perSecond: number;
    // Events let through at once, from a rested socket.
    burst: number;
};

export type RateLimiter = {
    allow: (event: string) => boolean;
};

type Options = {
    limits: Record<string, RateLimit>;
    fallback: RateLimit;
    now?: () => number;
};

const FALLBACK_KEY = "__fallback";

type Bucket = { tokens: number; updatedAt: number };

// A token bucket for each event name, for one socket. A bucket refills with
// time, so a socket that goes quiet gets its whole burst back. An event over
// the limit is refused, never queued.
export const createRateLimiter = ({
    limits,
    fallback,
    now = Date.now,
}: Options): RateLimiter => {
    const buckets = new Map<string, Bucket>();

    return {
        allow: (event) => {
            // The name comes from the client. Every name without a limit shares
            // one bucket, so inventing names cannot grow the map.
            const key = limits[event] ? event : FALLBACK_KEY;
            const limit = limits[event] ?? fallback;
            const current = now();
            const bucket = buckets.get(key) ?? {
                tokens: limit.burst,
                updatedAt: current,
            };

            const elapsedSeconds = (current - bucket.updatedAt) / 1000;
            bucket.tokens = Math.min(
                limit.burst,
                bucket.tokens + elapsedSeconds * limit.perSecond
            );
            bucket.updatedAt = current;
            buckets.set(key, bucket);

            if (bucket.tokens < 1) return false;
            bucket.tokens -= 1;
            return true;
        },
    };
};
