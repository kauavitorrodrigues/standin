import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryOverview } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import type { LibraryScope } from "@/features/library/types/LibraryScope";

export const LIBRARY_OVERVIEW_QUERY_KEY = "libraryOverview";

// The sidebar of the library, already built by the server: one group per
// category with how many families it holds.
export const libraryOverviewQueryOptions = (scope: LibraryScope) =>
    queryOptions({
        queryKey: [LIBRARY_OVERVIEW_QUERY_KEY, scope.key],
        queryFn: async (): Promise<LibraryOverview> => {
            const res = await api.get(`${scope.apiBase}/overview`);
            return res.data;
        },
    });

export const useLibraryOverview = () => {
    const scope = useLibraryScope();
    const query = useQuery(libraryOverviewQueryOptions(scope));
    return { ...query, groups: query.data?.groups ?? [] };
};
