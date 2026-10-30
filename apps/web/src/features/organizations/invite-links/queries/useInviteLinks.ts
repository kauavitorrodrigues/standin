import { useQuery } from "@tanstack/react-query";
import type { OrganizationInviteLink } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const ORGANIZATION_INVITE_LINKS_QUERY_KEY = "organizationInviteLinks";

// The links that can still be used. Only the owner (and the admin) reads them.
export const useOrganizationInviteLinks = (
    organizationId: string,
    enabled: boolean
) => {
    const query = useQuery({
        queryKey: [ORGANIZATION_INVITE_LINKS_QUERY_KEY, organizationId],
        queryFn: async (): Promise<OrganizationInviteLink[]> => {
            const res = await api.get(
                `/organizations/${organizationId}/invite-links`
            );
            return res.data.links;
        },
        enabled: !!organizationId && enabled,
    });
    return { ...query, links: query.data ?? [] };
};
