import type { QueryClient } from "@tanstack/react-query";
import { LIBRARY_FAMILIES_QUERY_KEY } from "../queries/useLibraryFamilies";
import { LIBRARY_FAMILY_FACETS_QUERY_KEY } from "../queries/useLibraryFamilyFacets";
import { LIBRARY_FAMILY_QUERY_KEY } from "../queries/useLibraryFamily";
import { LIBRARY_OVERVIEW_QUERY_KEY } from "../queries/useLibraryOverview";

// Everything that shows the library: the tilesets, the list of families, the
// detail of each one and the palette of every map.
export const invalidateLibrary = (queryClient: QueryClient) =>
    Promise.all([
        queryClient.invalidateQueries({
            queryKey: [LIBRARY_FAMILIES_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
            queryKey: [LIBRARY_FAMILY_FACETS_QUERY_KEY],
        }),
        queryClient.invalidateQueries({ queryKey: [LIBRARY_FAMILY_QUERY_KEY] }),
        queryClient.invalidateQueries({
            queryKey: [LIBRARY_OVERVIEW_QUERY_KEY],
        }),
    ]);
