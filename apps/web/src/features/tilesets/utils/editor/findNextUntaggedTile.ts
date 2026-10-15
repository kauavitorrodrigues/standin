import type { TileMeta } from "@standin/contracts";

// The next tile after `from` with no category, wrapping around. Null when
// every tile already has one.
export const findNextUntaggedTile = (
    tileMeta: TileMeta,
    tileCount: number,
    from: number
): number | null => {
    for (let step = 1; step <= tileCount; step++) {
        const index = (from + step) % tileCount;
        if (!(String(index) in tileMeta)) return index;
    }
    return null;
};
