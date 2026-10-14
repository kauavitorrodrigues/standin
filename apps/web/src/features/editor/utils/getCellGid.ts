import { TILED_LAYER_TYPES } from "@standin/contracts";
import type { Cell, LayerName, MapLayout } from "@standin/contracts";

// The gid on a cell of a tile layer, 0 for an empty cell or a missing layer.
export const getCellGid = (
    layout: Pick<MapLayout, "layers" | "width">,
    layer: LayerName,
    [x, y]: Cell
): number => {
    for (const candidate of layout.layers) {
        if (
            candidate.type === TILED_LAYER_TYPES.TILE_LAYER &&
            candidate.name === layer
        ) {
            return candidate.data[y * layout.width + x] ?? 0;
        }
    }
    return 0;
};
