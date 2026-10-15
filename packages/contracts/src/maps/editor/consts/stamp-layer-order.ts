import { LAYOUT_LAYER_NAMES } from "../../schemas/layout.schema";

// Order a stamp is cleared and painted in, as the layers are stacked.
export const STAMP_LAYER_ORDER = [
    LAYOUT_LAYER_NAMES.GROUND,
    LAYOUT_LAYER_NAMES.WALLS,
    LAYOUT_LAYER_NAMES.FURNITURE,
    LAYOUT_LAYER_NAMES.FOREGROUND,
] as const;
