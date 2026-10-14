import { queryOptions, useQuery } from "@tanstack/react-query";
import type { AreaDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const AREA_DETAILS_QUERY_KEY = "libraryArea";

// One area with its stamp, as the composer opens it.
export const areaDetailsQueryOptions = (areaId: string) =>
    queryOptions({
        queryKey: [AREA_DETAILS_QUERY_KEY, areaId],
        queryFn: async (): Promise<AreaDetail> => {
            const res = await api.get(`/library/areas/${areaId}`);
            return res.data.area;
        },
        enabled: !!areaId,
    });

export const useDetails = (areaId: string) => {
    const query = useQuery(areaDetailsQueryOptions(areaId));
    return { ...query, area: query.data };
};
