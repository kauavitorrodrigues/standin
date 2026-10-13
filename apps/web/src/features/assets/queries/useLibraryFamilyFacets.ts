import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryFamilyFacets } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const LIBRARY_FAMILY_FACETS_QUERY_KEY = "libraryFamilyFacets";

// The sidebar of the library, apart from the cards: the options of each
// filter with their totals. The filters of the list do not change it.
export const libraryFamilyFacetsQueryOptions = () =>
    queryOptions({
        queryKey: [LIBRARY_FAMILY_FACETS_QUERY_KEY],
        queryFn: async (): Promise<LibraryFamilyFacets> => {
            const res = await api.get("/library/assets/facets");
            return res.data;
        },
    });

export const useLibraryFamilyFacets = () =>
    useQuery(libraryFamilyFacetsQueryOptions());
