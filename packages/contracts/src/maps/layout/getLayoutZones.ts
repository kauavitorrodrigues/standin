import { TILED_LAYER_TYPES } from "../enums/tiled-layer-type";
import {
    LAYOUT_ZONES_LAYER_NAME,
    type MapLayout,
} from "../schemas/layout.schema";
import { isZoneObject, objectToZone, type Zone } from "./zone";

/** The zones of a layout: the objects of its `zones` group that have a kind. */
export const getLayoutZones = (layout: MapLayout): Zone[] =>
    layout.layers.flatMap((layer) => {
        if (layer.type !== TILED_LAYER_TYPES.OBJECT_GROUP) return [];
        if (layer.name !== LAYOUT_ZONES_LAYER_NAME) return [];
        return layer.objects.filter(isZoneObject).map(objectToZone);
    });
