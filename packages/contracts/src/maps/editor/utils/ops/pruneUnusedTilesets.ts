import { TILED_LAYER_TYPES } from "../../../enums/tiled-layer-type";
import { stripGidFlags } from "../../../layout/gid";
import type { LayoutLibrary } from "../../../layout/library";
import type { MapLayout } from "../../../schemas/layout.schema";

const isTilesetUsed = (
    layout: MapLayout,
    library: LayoutLibrary,
    name: string
): boolean => {
    const firstgid = layout.tilesets.find((item) => item.name === name)
        ?.firstgid;
    if (firstgid === undefined) return false;
    const end = firstgid + library.tilesets[name]?.tileCount;

    return layout.layers.some(
        (layer) =>
            layer.type === TILED_LAYER_TYPES.TILE_LAYER &&
            layer.data.some((raw) => {
                const gid = stripGidFlags(raw);
                return gid >= firstgid && gid < end;
            })
    );
};

/**
 * Drops the trailing tilesets that were in use before an erase and are not
 * anymore, so undoing a paint that added a tileset takes it back out. A
 * tileset that was already unused before stays, and so does any tileset that
 * is not the last one (removing it would shift later gids).
 */
export const pruneUnusedTilesets = (
    before: MapLayout,
    after: MapLayout,
    library: LayoutLibrary
): MapLayout => {
    let count = after.tilesets.length;

    while (
        count > 1 &&
        isTilesetUsed(before, library, after.tilesets[count - 1].name) &&
        !isTilesetUsed(after, library, after.tilesets[count - 1].name)
    ) {
        count--;
    }

    if (count === after.tilesets.length) return after;
    return { ...after, tilesets: after.tilesets.slice(0, count) };
};
