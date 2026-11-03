import { useQuery } from "@tanstack/react-query";
import type { OrganizationFixedLink } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { ORGANIZATION_FIXED_LINK_QUERY_KEY } from "../consts/queryKeys";

// The link holds a secret: it is read when the dialog opens and not kept
// around after.
export const useOrganizationFixedLink = (
    organizationId: string,
    enabled: boolean
) =>
    useQuery({
        queryKey: [ORGANIZATION_FIXED_LINK_QUERY_KEY, organizationId],
        queryFn: async (): Promise<OrganizationFixedLink> => {
            const res = await api.get(
                `/organizations/${organizationId}/invite-links/fixed`
            );
            return res.data.link;
        },
        enabled: !!organizationId && enabled,
        staleTime: 0,
        gcTime: 0,
    });
