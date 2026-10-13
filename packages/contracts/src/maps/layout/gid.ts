import type { MapLayout } from "../schemas/layout.schema";
import type { LayoutLibrary } from "./library";

// The three high bits of a Tiled gid are flip flags.
export const GID_MASK = 0x1fffffff;

export const stripGidFlags = (gid: number): number => gid & GID_MASK;

/** Gid one past the last tile of the last tileset, i.e. the next `firstgid`. */
export const getNextFirstGid = (
    layout: MapLayout,
    library: LayoutLibrary
): number => {
    const last = layout.tilesets[layout.tilesets.length - 1];
    if (!last) return 1;
    return last.firstgid + library.tilesets[last.name]?.tileCount;
};

/** Highest gid the declared tilesets can produce. */
export const getMaxGid = (layout: MapLayout, library: LayoutLibrary): number =>
    getNextFirstGid(layout, library) - 1;

/** Tileset and local tile index a gid points at, or null for empty or unknown. */
export const resolveGid = (
    layout: MapLayout,
    library: LayoutLibrary,
    rawGid: number
): { tilesetId: string; tileIndex: number } | null => {
    const gid = stripGidFlags(rawGid);
    if (gid === 0) return null;

    for (let index = layout.tilesets.length - 1; index >= 0; index--) {
        const tileset = layout.tilesets[index];
        if (gid >= tileset.firstgid) {
            const tileCount = library.tilesets[tileset.name]?.tileCount;
            if (gid >= tileset.firstgid + tileCount) return null;
            return {
                tilesetId: tileset.name,
                tileIndex: gid - tileset.firstgid,
            };
        }
    }

    return null;
};
