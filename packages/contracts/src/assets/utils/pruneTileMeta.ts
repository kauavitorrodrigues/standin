import type { TileMeta } from "../schemas/tile-meta.schema";

// Drops what points past the last tile, which is what is left behind when the
// margin or the spacing is changed to a grid with fewer tiles. A top that
// points outside is dropped from its wall, which stays. Shared with the web,
// which shows the result before the grid is changed.
export const pruneTileMeta = (meta: TileMeta, tileCount: number): TileMeta =>
    Object.fromEntries(
        Object.entries(meta)
            .filter(([index]) => Number(index) < tileCount)
            .map(([index, entry]) => {
                const { top, ...rest } = entry;
                const keepsTop = top !== undefined && top < tileCount;
                return [index, keepsTop ? { ...rest, top } : rest];
            })
    );
