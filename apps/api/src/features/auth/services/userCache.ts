import type { User } from "@standin/contracts";
import { createTtlCache } from "@/lib/cache/createTtlCache";

const USER_CACHE_TTL_MS = 30_000;
const USER_CACHE_MAX_ENTRIES = 5_000;

const cache = createTtlCache<User>({
    ttlMs: USER_CACHE_TTL_MS,
    maxEntries: USER_CACHE_MAX_ENTRIES,
});

// The person behind a token, so a request or a socket handshake does not hit
// the database every time. Whatever changes the person calls `invalidate`, and
// the ttl covers the changes nobody announces.
export const UserCache = {
    get: (userId: string) => cache.get(userId),
    // Frozen, since every request gets the same object and none may change it.
    set: (user: User) => cache.set(user.id, Object.freeze({ ...user })),
    invalidate: (userId: string) => cache.delete(userId),
    clear: () => cache.clear(),
};
