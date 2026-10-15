import { searchFamilies } from "@standin/contracts";
import type { PaletteCategories } from "@/features/assets/types/mapPalette";

// The categories that have no family matching the search. With no text,
// every category is still available.
export const getCategoriesWithoutMatch = (
    categories: PaletteCategories,
    search: string
): string[] => {
    if (search.trim() === "") return [];

    return categories
        .filter(({ families }) => searchFamilies(families, search).length === 0)
        .map(({ category }) => category);
};
