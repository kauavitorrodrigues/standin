import { queryOptions, useQuery } from "@tanstack/react-query";
import type { AreaDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import type { LibraryScope } from "@/features/library/types/LibraryScope";

export const AREA_DETAILS_QUERY_KEY = "libraryArea";

// One area with its stamp, as the composer opens it.
export const areaDetailsQueryOptions = (scope: LibraryScope, areaId: string) =>
    queryOptions({
        queryKey: [AREA_DETAILS_QUERY_KEY, scope.key, areaId],
        queryFn: async (): Promise<AreaDetail> => {
            const res = await api.get(`${scope.apiBase}/areas/${areaId}`);
            return res.data.area;
        },
        enabled: !!areaId,
    });

export const useDetails = (areaId: string) => {
    const scope = useLibraryScope();
    const query = useQuery(areaDetailsQueryOptions(scope, areaId));
    return { ...query, area: query.data };
};
