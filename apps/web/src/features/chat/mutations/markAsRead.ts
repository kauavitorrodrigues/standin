import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import {
    unreadCountsQueryKey,
    conversationsQueryKey,
} from "@/features/chat/queries/queryKey";

export const useMarkConversationAsRead = () => {
    const queryClient = useQueryClient();
    const organizationId = useOrganization().organization?.id ?? "";

    return useMutation({
        mutationFn: async (conversationId: string) => {
            await api.post(
                `/organizations/${organizationId}/conversations/${conversationId}/read`
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: unreadCountsQueryKey(organizationId),
            });
            // The per-conversation badge in the DM list reads unreadCount
            // off this query, not off unreadCountsQueryKey, so it needs its
            // own invalidation too.
            queryClient.invalidateQueries({
                queryKey: conversationsQueryKey(organizationId),
            });
        },
    });
};
