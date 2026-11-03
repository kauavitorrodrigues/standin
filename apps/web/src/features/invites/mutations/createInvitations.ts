import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    OrganizationInvitationCreated,
    OrganizationInvitationCreateRequest,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { ORGANIZATION_INVITATIONS_QUERY_KEY } from "../consts/queryKeys";

// One invitation per e-mail, with a desk kept for them when one is given.
export const useCreateInvitations = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            input: OrganizationInvitationCreateRequest
        ): Promise<OrganizationInvitationCreated> => {
            const res = await api.post(
                `/organizations/${organizationId}/invitations`,
                input
            );
            return res.data;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [ORGANIZATION_INVITATIONS_QUERY_KEY, organizationId],
            }),
    });
};
