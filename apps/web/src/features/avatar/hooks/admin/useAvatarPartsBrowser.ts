import { useState } from "react";
import { useAvatarParts } from "../../queries/admin/useAvatarParts";
import type { AvatarPartFilters } from "../../types/admin/partFilters";
import { filterParts } from "../../utils/admin/filterParts";
import { flattenPartFamilies } from "../../utils/admin/flattenPartFamilies";
import { getActivePartFilterChips } from "../../utils/admin/getActivePartFilterChips";
import { getPartFacets } from "../../utils/admin/getPartFacets";

// The state of the admin page: the filters, the parts they narrow down (one per family), and
// the facets they are built from.
export const useAvatarPartsBrowser = () => {
    const { slots } = useAvatarParts();
    const [filters, setFilters] = useState<AvatarPartFilters>({});

    const families = flattenPartFamilies(slots);

    const changeFilters = (changes: AvatarPartFilters) => {
        setFilters((current) => ({ ...current, ...changes }));
    };

    return {
        filters,
        facets: getPartFacets(families),
        changeFilters,
        chips: getActivePartFilterChips(filters),
        parts: filterParts(families, filters),
    };
};
