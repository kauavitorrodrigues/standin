import { TILED_LAYER_TYPES } from "../../enums/tiled-layer-type";
import type { LayoutTileLayer, MapLayout } from "../../schemas/layout.schema";

export const findTileLayer = (
    layout: MapLayout,
    name: string
): LayoutTileLayer | undefined =>
    layout.layers.find(
        (layer): layer is LayoutTileLayer =>
            layer.type === TILED_LAYER_TYPES.TILE_LAYER && layer.name === name
    );
