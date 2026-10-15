import { useState } from "react";
import { useLibraryFamilies } from "../queries/useLibraryFamilies";
import { useLibraryFamilyFacets } from "../queries/useLibraryFamilyFacets";
import type { LibraryFilters } from "../types/libraryFilters";
import { getActiveFilterChips } from "../utils/getActiveFilterChips";

// The state of the library page: the filters, the families they narrow down,
// and the family whose panel is open.
export const useAssetsBrowser = () => {
    const [filters, setFilters] = useState<LibraryFilters>({});
    const { data: facets } = useLibraryFamilyFacets();
    const list = useLibraryFamilies(filters);

    // Kept by id, so the panel follows the list when it refetches.
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = list.families.find((f) => f.familyId === selectedId);

    // The panel keeps the last family while it slides out, so it does not go
    // blank in the middle of the animation.
    const [shown, setShown] = useState(selected);
    if (selected && selected !== shown) setShown(selected);

    const changeFilters = (changes: LibraryFilters) => {
        setFilters((current) => ({ ...current, ...changes }));
    };

    return {
        filters,
        facets,
        changeFilters,
        chips: getActiveFilterChips(filters),
        list,
        selectedId,
        selected,
        shown,
        select: (familyId: string) => setSelectedId(familyId),
        closePanel: () => setSelectedId(null),
    };
};
