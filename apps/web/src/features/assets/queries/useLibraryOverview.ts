import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryOverview } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const LIBRARY_OVERVIEW_QUERY_KEY = "libraryOverview";

// The sidebar of the library, already built by the server: one group per
// category with how many families it holds.
export const libraryOverviewQueryOptions = () =>
    queryOptions({
        queryKey: [LIBRARY_OVERVIEW_QUERY_KEY],
        queryFn: async (): Promise<LibraryOverview> => {
            const res = await api.get("/library/overview");
            return res.data;
        },
    });

export const useLibraryOverview = () => {
    const query = useQuery(libraryOverviewQueryOptions());
    return { ...query, groups: query.data?.groups ?? [] };
};
