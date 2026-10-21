// The key of the texture that can go: the one used longest ago, as long as it
// has been idle for `minIdleMs`. Null when every texture was used lately.
// `now` and the times in `lastUsedAt` are scene time in ms.
export const findEvictableTexture = (
    lastUsedAt: ReadonlyMap<string, number>,
    now: number,
    minIdleMs: number
): string | null => {
    let oldestKey: string | null = null;
    let oldestAt = Number.POSITIVE_INFINITY;
    lastUsedAt.forEach((at, key) => {
        if (at < oldestAt) {
            oldestAt = at;
            oldestKey = key;
        }
    });

    if (oldestKey === null) return null;
    return now - oldestAt >= minIdleMs ? oldestKey : null;
};
