import {
    LAYOUT_AREA_FLOOR_LAYER_NAME,
    LAYOUT_LAYER_NAMES,
} from "../../schemas/layout.schema";

// Order a stamp is cleared and painted in, as the layers are stacked.
export const STAMP_LAYER_ORDER = [
    LAYOUT_LAYER_NAMES.GROUND,
    LAYOUT_LAYER_NAMES.WALLS,
    LAYOUT_LAYER_NAMES.FURNITURE,
    LAYOUT_LAYER_NAMES.FOREGROUND,
] as const;

// The layer of the map that holds what a stamp layer paints. The ground of an
// area goes on the floor layer of the areas, above the ground of the map, so
// the map keeps its own ground under the area. The other layers are shared.
// The composer has no floor layer of areas, so it asks for its own ground.
export const getMapLayerOfStampLayer = (
    stampLayer: (typeof STAMP_LAYER_ORDER)[number],
    groundLayer: string = LAYOUT_AREA_FLOOR_LAYER_NAME
): string =>
    stampLayer === LAYOUT_LAYER_NAMES.GROUND ? groundLayer : stampLayer;
