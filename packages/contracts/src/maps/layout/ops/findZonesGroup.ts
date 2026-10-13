import { TILED_LAYER_TYPES } from "../../enums/tiled-layer-type";
import {
    LAYOUT_ZONES_LAYER_NAME,
    type LayoutObjectGroup,
    type MapLayout,
} from "../../schemas/layout.schema";

export const findZonesGroup = (
    layout: MapLayout
): LayoutObjectGroup | undefined =>
    layout.layers.find(
        (layer): layer is LayoutObjectGroup =>
            layer.type === TILED_LAYER_TYPES.OBJECT_GROUP &&
            layer.name === LAYOUT_ZONES_LAYER_NAME
    );
