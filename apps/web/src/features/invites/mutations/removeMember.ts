import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { ORGANIZATION_MEMBERS_QUERY_KEY } from "@/features/organizations/queries/members";
import {
    MEMBER_ENTRIES_QUERY_KEY,
    ORGANIZATION_INVITATIONS_QUERY_KEY,
} from "../consts/queryKeys";

// The owner removes a member: the person loses the access at once.
export const useRemoveMember = (organizationId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string): Promise<void> => {
            await api.delete(
                `/organizations/${organizationId}/members/${userId}`
            );
        },
        onSuccess: () => {
            for (const key of [
                MEMBER_ENTRIES_QUERY_KEY,
                ORGANIZATION_INVITATIONS_QUERY_KEY,
                ORGANIZATION_MEMBERS_QUERY_KEY,
            ]) {
                queryClient.invalidateQueries({
                    queryKey: [key, organizationId],
                });
            }
        },
    });
};
