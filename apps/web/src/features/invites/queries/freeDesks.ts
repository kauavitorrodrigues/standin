import { useQuery } from "@tanstack/react-query";
import type { FreeDesk } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { FREE_DESKS_QUERY_KEY } from "../consts/queryKeys";

// The desks of a space that nobody holds, to keep for an invited person.
export const useFreeDesks = (
    organizationId: string,
    spaceId: string | null
) => {
    const query = useQuery({
        queryKey: [FREE_DESKS_QUERY_KEY, organizationId, spaceId],
        queryFn: async (): Promise<FreeDesk[]> => {
            const res = await api.get(
                `/organizations/${organizationId}/invitations/free-desks/${spaceId}`
            );
            return res.data.desks;
        },
        enabled: !!organizationId && !!spaceId,
    });
    return { ...query, desks: query.data ?? [] };
};
