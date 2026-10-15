import {
    normalizeSearchText,
    type LibraryPaletteArea,
} from "@standin/contracts";

// The areas whose name has the search, ignoring case and accents. Without
// text, every area, in the order the palette sent them.
export const searchAreas = (
    areas: readonly LibraryPaletteArea[],
    query: string
): LibraryPaletteArea[] => {
    const term = normalizeSearchText(query.trim());
    if (term === "") return [...areas];
    return areas.filter(({ name }) => normalizeSearchText(name).includes(term));
};
