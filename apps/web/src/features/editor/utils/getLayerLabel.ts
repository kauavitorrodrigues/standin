import { LAYOUT_LAYER_NAMES } from "@standin/contracts";

// The name of a layer for people. An unknown layer shows its own name.
export const getLayerLabel = (layer: string): string => {
    switch (layer) {
        case LAYOUT_LAYER_NAMES.GROUND:
            return "chão";
        case LAYOUT_LAYER_NAMES.WALLS:
            return "paredes";
        case LAYOUT_LAYER_NAMES.FURNITURE:
            return "mobília";
        case LAYOUT_LAYER_NAMES.FOREGROUND:
            return "primeiro plano";
        default:
            return layer;
    }
};
