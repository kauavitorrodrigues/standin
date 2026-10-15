import type { MapLayout } from "../../schemas/layout.schema";
import { getNextFirstGid } from "../../layout/gid";
import type { LayoutLibrary } from "../../layout/library";

/**
 * Layout with the tileset declared. A missing tileset is appended at the end,
 * never reordered, because the gids already painted depend on the order. The
 * input is not mutated and a layout that already has the tileset is returned
 * as is.
 */
export const ensureTileset = (
    layout: MapLayout,
    tilesetId: string,
    library: LayoutLibrary
): MapLayout => {
    if (layout.tilesets.some(({ name }) => name === tilesetId)) return layout;

    return {
        ...layout,
        tilesets: [
            ...layout.tilesets,
            { name: tilesetId, firstgid: getNextFirstGid(layout, library) },
        ],
    };
};
