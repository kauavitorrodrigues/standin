import { createTtlCache } from "@/lib/cache/createTtlCache";
import type { JoinAccess } from "./resolveJoinAccess";

const JOIN_ACCESS_TTL_MS = 30_000;
const JOIN_ACCESS_MAX_ENTRIES = 10_000;

const cache = createTtlCache<JoinAccess>({
    ttlMs: JOIN_ACCESS_TTL_MS,
    maxEntries: JOIN_ACCESS_MAX_ENTRIES,
});

const buildKey = (userId: string, spaceId: string) => `${userId}:${spaceId}`;

// What a person may be in a space, remembered for a short while so a join and
// the check made after it do not read the database again. Only a granted
// access is kept: a denial is read again on the next try, so an admission
// never waits for the ttl. The events that end an access call the invalidate
// functions, the ttl covers the ones nobody announces.
export const JoinAccessCache = {
    get: (userId: string, spaceId: string) =>
        cache.get(buildKey(userId, spaceId)),
    set: (userId: string, spaceId: string, access: JoinAccess) =>
        cache.set(buildKey(userId, spaceId), access),
    invalidate: (userId: string, spaceId: string) =>
        cache.delete(buildKey(userId, spaceId)),
    invalidateUser: (userId: string) =>
        cache.deleteWhere((key) => key.startsWith(`${userId}:`)),
    invalidateSpace: (spaceId: string) =>
        cache.deleteWhere((key) => key.endsWith(`:${spaceId}`)),
    clear: () => cache.clear(),
};
