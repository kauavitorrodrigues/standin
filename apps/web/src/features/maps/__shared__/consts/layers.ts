import { LAYOUT_LAYER_NAMES } from "@standin/contracts";
import type { LayerName } from "@standin/contracts";
import type { LayerVisibility } from "@/features/maps/__shared__/types/layer-visibility";

// The tile layers from the top of the stack to the bottom. The layer
// selector lists them in this order.
export const EDITOR_LAYERS: readonly LayerName[] = [
    LAYOUT_LAYER_NAMES.FOREGROUND,
    LAYOUT_LAYER_NAMES.FURNITURE,
    LAYOUT_LAYER_NAMES.WALLS,
    LAYOUT_LAYER_NAMES.GROUND,
];

export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
    [LAYOUT_LAYER_NAMES.GROUND]: true,
    [LAYOUT_LAYER_NAMES.WALLS]: true,
    [LAYOUT_LAYER_NAMES.FURNITURE]: true,
    [LAYOUT_LAYER_NAMES.FOREGROUND]: true,
};

// The layers the eyedropper looks at, first match wins. The foreground comes
// last because it holds the tops derived from the walls.
export const PICK_LAYER_ORDER: readonly LayerName[] = [
    LAYOUT_LAYER_NAMES.FURNITURE,
    LAYOUT_LAYER_NAMES.WALLS,
    LAYOUT_LAYER_NAMES.GROUND,
    LAYOUT_LAYER_NAMES.FOREGROUND,
];
