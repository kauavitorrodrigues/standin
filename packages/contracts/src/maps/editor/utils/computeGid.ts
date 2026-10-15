import type { MapLayout } from "../../schemas/layout.schema";
import { getNextFirstGid } from "../../layout/gid";
import type { LayoutLibrary } from "../../layout/library";

/**
 * Gid of a tile: the tileset `firstgid` plus the local index. When the tileset
 * is not in the layout yet, uses the `firstgid` it would receive, which is the
 * last `firstgid` plus the tile count of the last tileset.
 */
export const computeGid = (
    layout: MapLayout,
    tilesetId: string,
    tileIndex: number,
    library: LayoutLibrary
): number => {
    const tileset = layout.tilesets.find(({ name }) => name === tilesetId);
    const firstgid = tileset
        ? tileset.firstgid
        : getNextFirstGid(layout, library);
    return firstgid + tileIndex;
};
