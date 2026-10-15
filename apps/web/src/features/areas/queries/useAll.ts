import {
    keepPreviousData,
    queryOptions,
    useQuery,
} from "@tanstack/react-query";
import type { AreaListQuery } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import type { AreaListResponse } from "../types/areaList";

export const AREAS_QUERY_KEY = "libraryAreas";

export const areasQueryOptions = (query: AreaListQuery) =>
    queryOptions({
        queryKey: [AREAS_QUERY_KEY, query],
        queryFn: async (): Promise<AreaListResponse> => {
            const res = await api.get("/library/areas", { params: query });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

// The search runs on the server, which ignores case and accents.
export const useAll = (query: AreaListQuery = {}) => {
    const result = useQuery(areasQueryOptions(query));
    return { ...result, areas: result.data?.areas ?? [] };
};
