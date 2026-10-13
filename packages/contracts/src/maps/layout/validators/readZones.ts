import { TILED_LAYER_TYPES } from "../../enums/tiled-layer-type";
import { LAYOUT_ZONES_LAYER_NAME } from "../../schemas/layout.schema";
import type { LooseLayout } from "../types/loose-layout";
import { isZoneObject, objectToZone, type Zone } from "../zone";

export const readZones = (layout: LooseLayout): Zone[] =>
    (layout.layers ?? [])
        .filter(
            (layer) =>
                layer.type === TILED_LAYER_TYPES.OBJECT_GROUP &&
                layer.name === LAYOUT_ZONES_LAYER_NAME
        )
        .flatMap((layer) => layer.objects ?? [])
        .filter(isZoneObject)
        .map(objectToZone);
