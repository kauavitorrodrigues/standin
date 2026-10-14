import {
    keepPreviousData,
    queryOptions,
    useQuery,
} from "@tanstack/react-query";
import type { AreaListQuery } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import type { LibraryScope } from "@/features/library/types/LibraryScope";
import type { AreaListResponse } from "../types/areaList";

export const AREAS_QUERY_KEY = "libraryAreas";

export const areasQueryOptions = (scope: LibraryScope, query: AreaListQuery) =>
    queryOptions({
        queryKey: [AREAS_QUERY_KEY, scope.key, query],
        queryFn: async (): Promise<AreaListResponse> => {
            const res = await api.get(`${scope.apiBase}/areas`, {
                params: query,
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

// The search runs on the server, which ignores case and accents.
export const useAll = (query: AreaListQuery = {}) => {
    const scope = useLibraryScope();
    const result = useQuery(areasQueryOptions(scope, query));
    return { ...result, areas: result.data?.areas ?? [] };
};
