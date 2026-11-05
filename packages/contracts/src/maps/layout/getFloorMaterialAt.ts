import { DEFAULT_FLOOR_MATERIAL } from "../../assets/enums/floor-material";
import type { FloorMaterial } from "../../assets/types/floor-material";
import { LAYOUT_LAYER_NAMES, type MapLayout } from "../schemas/layout.schema";
import { resolveGid } from "./gid";
import type { LayoutLibrary } from "./library";
import { findTileLayer } from "./ops/findTileLayer";

/**
 * Material of the floor tile at a cell of the ground layer. An empty cell, a
 * cell outside the map, a tileset the library does not know and a tile
 * without a material all answer wood.
 */
export const getFloorMaterialAt = (
    layout: MapLayout,
    library: LayoutLibrary,
    tileX: number,
    tileY: number
): FloorMaterial => {
    if (tileX < 0 || tileY < 0) return DEFAULT_FLOOR_MATERIAL;
    if (tileX >= layout.width || tileY >= layout.height) {
        return DEFAULT_FLOOR_MATERIAL;
    }

    const ground = findTileLayer(layout, LAYOUT_LAYER_NAMES.GROUND);
    const gid = ground?.data[tileY * layout.width + tileX];
    if (!gid) return DEFAULT_FLOOR_MATERIAL;

    const tile = resolveGid(layout, library, gid);
    if (!tile) return DEFAULT_FLOOR_MATERIAL;

    const meta = library.tilesets[tile.tilesetId]?.tileMeta;
    return meta?.[String(tile.tileIndex)]?.material ?? DEFAULT_FLOOR_MATERIAL;
};
