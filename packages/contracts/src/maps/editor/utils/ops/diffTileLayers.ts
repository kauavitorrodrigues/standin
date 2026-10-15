import { TILED_LAYER_TYPES } from "../../../enums/tiled-layer-type";
import type { MapLayout } from "../../../schemas/layout.schema";
import type { CellDiff } from "../../types/cell-diff";

/** Every tile cell whose gid differs between two layouts, layer by layer. */
export const diffTileLayers = (
    before: MapLayout,
    after: MapLayout
): CellDiff[] => {
    const diff: CellDiff[] = [];

    for (const layer of before.layers) {
        if (layer.type !== TILED_LAYER_TYPES.TILE_LAYER) continue;
        const next = after.layers.find(
            (item) =>
                item.type === TILED_LAYER_TYPES.TILE_LAYER &&
                item.name === layer.name
        );
        if (!next || next.type !== TILED_LAYER_TYPES.TILE_LAYER) continue;

        layer.data.forEach((gid, index) => {
            const nextGid = next.data[index];
            if (gid === nextGid) return;
            diff.push({
                layer: layer.name,
                x: index % before.width,
                y: Math.floor(index / before.width),
                before: gid,
                after: nextGid,
            });
        });
    }

    return diff;
};
