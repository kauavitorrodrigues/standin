import { TILE_CATEGORIES } from "../../../assets/enums/tile-category";
import { LAYOUT_LAYER_NAMES } from "../../schemas/layout.schema";

// The layer each tile category is painted on.
export const LAYER_BY_CATEGORY: Record<string, string> = {
    [TILE_CATEGORIES.FLOOR]: LAYOUT_LAYER_NAMES.GROUND,
    [TILE_CATEGORIES.WALL]: LAYOUT_LAYER_NAMES.WALLS,
    [TILE_CATEGORIES.DECORATION]: LAYOUT_LAYER_NAMES.FURNITURE,
    [TILE_CATEGORIES.CEILING]: LAYOUT_LAYER_NAMES.FOREGROUND,
};
