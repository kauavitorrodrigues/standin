import { TILED_LAYER_TYPES } from "../../enums/tiled-layer-type";
import {
    LAYOUT_AREA_FLOOR_LAYER_NAME,
    LAYOUT_LAYER_NAMES,
    type LayoutTileLayer,
    type MapLayout,
} from "../../schemas/layout.schema";
import { findTileLayer } from "./findTileLayer";

/**
 * The floor layer of the areas, created empty right above the ground when the
 * layout has none (a map saved before areas had their own floor). It changes
 * the layout in place and answers the layer.
 */
export const ensureAreaFloorLayer = (layout: MapLayout): LayoutTileLayer => {
    const existing = findTileLayer(layout, LAYOUT_AREA_FLOOR_LAYER_NAME);
    if (existing) return existing;

    const nextId =
        layout.nextlayerid ??
        Math.max(0, ...layout.layers.map((item) => item.id)) + 1;
    const layer: LayoutTileLayer = {
        id: nextId,
        type: TILED_LAYER_TYPES.TILE_LAYER,
        name: LAYOUT_AREA_FLOOR_LAYER_NAME,
        x: 0,
        y: 0,
        width: layout.width,
        height: layout.height,
        visible: true,
        opacity: 1,
        data: new Array<number>(layout.width * layout.height).fill(0),
    };
    layout.nextlayerid = nextId + 1;

    const groundIndex = layout.layers.findIndex(
        (item) =>
            item.type === TILED_LAYER_TYPES.TILE_LAYER &&
            item.name === LAYOUT_LAYER_NAMES.GROUND
    );
    layout.layers.splice(groundIndex + 1, 0, layer);
    return layer;
};
