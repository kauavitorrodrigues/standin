import { UNTAGGED_COLOR, getTileCategoryMeta } from "../../consts/categoryMeta";
import type { TileCategory } from "../../types/meta";

// The color of a tile on the sheet: the one of its category, or the neutral
// one when it has none.
export const getTileColor = (category: TileCategory | undefined): string => {
    if (!category) return UNTAGGED_COLOR;
    return getTileCategoryMeta(category).color;
};
