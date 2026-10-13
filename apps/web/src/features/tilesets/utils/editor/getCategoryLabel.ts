import { getTileCategoryMeta } from "../../consts/categoryMeta";
import type { TileCategory } from "../../types/meta";

// What a tile is called, by its category, or what it is when it has none.
export const getTileCategoryLabel = (
    category: TileCategory | undefined
): string => {
    if (!category) return "sem categoria";
    return getTileCategoryMeta(category).label;
};
