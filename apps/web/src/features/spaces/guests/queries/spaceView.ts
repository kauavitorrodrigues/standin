import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SpaceView } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_VIEW_QUERY_KEY } from "../consts/queryKeys";

// The space as a member or an admitted guest opens it, by its id alone.
export const spaceViewQueryOptions = (spaceId: string) =>
    queryOptions({
        queryKey: [SPACE_VIEW_QUERY_KEY, spaceId],
        queryFn: async (): Promise<SpaceView> => {
            const res = await api.get(`/spaces/${spaceId}`);
            return res.data.space;
        },
        enabled: !!spaceId,
        retry: false,
    });

export const useSpaceView = (spaceId: string) => {
    const query = useQuery(spaceViewQueryOptions(spaceId));
    return { ...query, space: query.data };
};
