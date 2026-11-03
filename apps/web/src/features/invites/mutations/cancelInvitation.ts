import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { ORGANIZATION_INVITATIONS_QUERY_KEY } from "../consts/queryKeys";

// Closes an invitation: its link stops working.
export const useCancelInvitation = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (invitationId: string): Promise<void> => {
            await api.delete(
                `/organizations/${organizationId}/invitations/${invitationId}`
            );
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: [ORGANIZATION_INVITATIONS_QUERY_KEY, organizationId],
            }),
    });
};
