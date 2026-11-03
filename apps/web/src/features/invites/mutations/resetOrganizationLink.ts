import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrganizationFixedLink } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { ORGANIZATION_FIXED_LINK_QUERY_KEY } from "../consts/queryKeys";

// Closes the member link and makes another. The old one stops working.
export const useResetOrganizationLink = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<OrganizationFixedLink> => {
            const res = await api.post(
                `/organizations/${organizationId}/invite-links/fixed/reset`
            );
            return res.data.link;
        },
        onSuccess: (link) =>
            queryClient.setQueryData(
                [ORGANIZATION_FIXED_LINK_QUERY_KEY, organizationId],
                link
            ),
    });
};
