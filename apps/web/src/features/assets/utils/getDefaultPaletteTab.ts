import { TILES_TAB } from "../consts/palette";

// The tab the palette opens on: the first category, or the tilesets when no
// category has assets.
export const getDefaultPaletteTab = (
    categories: { category: string }[]
): string => {
    const [first] = categories;
    if (!first) return TILES_TAB;
    return first.category;
};
