import { normalizeSearchText } from "@standin/contracts";

// The tilesets whose name matches the search, by name. Accent and case are
// ignored, and an empty search matches every tileset.
export const searchTilesets = <T extends { name: string }>(
    tilesets: T[],
    query: string
): T[] => {
    const term = normalizeSearchText(query.trim());
    return tilesets
        .filter(({ name }) => normalizeSearchText(name).includes(term))
        .sort((a, b) =>
            a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
        );
};
