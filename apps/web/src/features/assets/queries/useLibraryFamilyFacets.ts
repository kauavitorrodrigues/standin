import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryFamilyFacets } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import type { LibraryScope } from "@/features/library/types/LibraryScope";

export const LIBRARY_FAMILY_FACETS_QUERY_KEY = "libraryFamilyFacets";

// The sidebar of the library, apart from the cards: the options of each
// filter with their totals. The filters of the list do not change it.
export const libraryFamilyFacetsQueryOptions = (scope: LibraryScope) =>
    queryOptions({
        queryKey: [LIBRARY_FAMILY_FACETS_QUERY_KEY, scope.key],
        queryFn: async (): Promise<LibraryFamilyFacets> => {
            const res = await api.get(`${scope.apiBase}/assets/facets`);
            return res.data;
        },
    });

export const useLibraryFamilyFacets = () => {
    const scope = useLibraryScope();
    return useQuery(libraryFamilyFacetsQueryOptions(scope));
};
