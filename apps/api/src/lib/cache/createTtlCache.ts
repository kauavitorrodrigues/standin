export type TtlCache<Value> = {
    get: (key: string) => Value | undefined;
    set: (key: string, value: Value) => void;
    delete: (key: string) => void;
    deleteWhere: (predicate: (key: string) => boolean) => void;
    clear: () => void;
};

type Options = {
    ttlMs: number;
    // Bounds the memory: past this the oldest entry makes room.
    maxEntries: number;
    now?: () => number;
};

// A small in-memory cache where every entry expires after `ttlMs`. Reads never
// refresh the expiry, so a stale value cannot outlive the ttl.
export const createTtlCache = <Value>({
    ttlMs,
    maxEntries,
    now = Date.now,
}: Options): TtlCache<Value> => {
    const entries = new Map<string, { value: Value; expiresAt: number }>();

    return {
        get: (key) => {
            const entry = entries.get(key);
            if (!entry) return undefined;
            if (entry.expiresAt <= now()) {
                entries.delete(key);
                return undefined;
            }
            return entry.value;
        },
        set: (key, value) => {
            entries.delete(key);
            if (entries.size >= maxEntries) {
                const oldest = entries.keys().next();
                if (!oldest.done) entries.delete(oldest.value);
            }
            entries.set(key, { value, expiresAt: now() + ttlMs });
        },
        delete: (key) => {
            entries.delete(key);
        },
        deleteWhere: (predicate) => {
            for (const key of [...entries.keys()]) {
                if (predicate(key)) entries.delete(key);
            }
        },
        clear: () => entries.clear(),
    };
};
