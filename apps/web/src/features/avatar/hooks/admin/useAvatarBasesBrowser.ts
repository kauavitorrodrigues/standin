import { useState } from "react";
import { useAvatarBases } from "../../queries/admin/useAvatarBases";
import type { AvatarBaseFilters } from "../../types/admin/baseFilters";
import { filterBases } from "../../utils/admin/filterBases";
import { getActiveBaseFilterChips } from "../../utils/admin/getActiveBaseFilterChips";
import { getBaseFacets } from "../../utils/admin/getBaseFacets";

// The state of the admin page: the filters, the bases they narrow down, and
// the facets they are built from.
export const useAvatarBasesBrowser = () => {
    const { groups, isLoading, isError } = useAvatarBases();
    const [filters, setFilters] = useState<AvatarBaseFilters>({});

    const bases = groups.flatMap((group) => group.bases);

    const changeFilters = (changes: AvatarBaseFilters) => {
        setFilters((current) => ({ ...current, ...changes }));
    };

    return {
        isLoading,
        isError,
        isEmpty: bases.length === 0,
        filters,
        facets: getBaseFacets(bases),
        changeFilters,
        chips: getActiveBaseFilterChips(filters),
        bases: filterBases(bases, filters),
    };
};
