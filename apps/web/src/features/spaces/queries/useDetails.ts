import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SpaceDetails } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useQueryUtils } from "@/lib/tanstack/useQueryUtils";

export const SPACE_DETAILS_QUERY_KEY = "spaceDetails";

export const spaceDetailsQueryOptions = (
    organizationId: string,
    spaceId: string,
) =>
    queryOptions({
        queryKey: [SPACE_DETAILS_QUERY_KEY, organizationId, spaceId],
        queryFn: async (): Promise<SpaceDetails> => {
            const res = await api.get(
                `/organizations/${organizationId}/spaces/${spaceId}`,
            );
            return res.data.space;
        },
        enabled: !!organizationId && !!spaceId,
    });

export const useSpaceDetails = (organizationId: string, spaceId: string) => {
    const query = useQuery(spaceDetailsQueryOptions(organizationId, spaceId));
    return { ...query, space: query.data };
};

export const useSpaceDetailsQueryUtils = (
    organizationId: string,
    spaceId: string,
) =>
    useQueryUtils<SpaceDetails>([
        SPACE_DETAILS_QUERY_KEY,
        organizationId,
        spaceId,
    ]);
