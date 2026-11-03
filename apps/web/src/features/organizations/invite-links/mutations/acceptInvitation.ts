import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { OrganizationInvitationAccepted } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { setActiveOrganizationId } from "@/features/organizations/lib/activeOrganization";
import { ORGANIZATIONS_QUERY_KEY } from "@/features/organizations/queries/organizations";

// A person with an account takes an invitation by e-mail and lands in that
// organization.
export const useAcceptInvitation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            token: string
        ): Promise<OrganizationInvitationAccepted> => {
            const res = await api.post(
                `/organization-invites/${encodeURIComponent(token)}/accept`
            );
            return res.data;
        },
        onSuccess: async ({ organizationId }) => {
            // The list must be fresh before the app picks the active one.
            await queryClient.invalidateQueries({
                queryKey: ORGANIZATIONS_QUERY_KEY,
            });
            setActiveOrganizationId(organizationId);
        },
    });
};
