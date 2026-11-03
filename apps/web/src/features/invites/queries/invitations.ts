import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { OrganizationInvitation } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { ORGANIZATION_INVITATIONS_QUERY_KEY } from "../consts/queryKeys";
import type { PageParams } from "../types/page";

// A page of the invitations still waiting. They carry the link, so they are
// not kept around once the list closes. The server pages and searches them.
export const useInvitations = (
    organizationId: string,
    enabled: boolean,
    params: PageParams
) => {
    const query = useQuery({
        queryKey: [ORGANIZATION_INVITATIONS_QUERY_KEY, organizationId, params],
        queryFn: async (): Promise<{
            invitations: OrganizationInvitation[];
            total: number;
        }> => {
            const res = await api.get(
                `/organizations/${organizationId}/invitations`,
                { params }
            );
            return res.data;
        },
        enabled: !!organizationId && enabled,
        gcTime: 0,
        placeholderData: keepPreviousData,
    });
    return {
        ...query,
        invitations: query.data?.invitations ?? [],
        total: query.data?.total ?? 0,
    };
};
