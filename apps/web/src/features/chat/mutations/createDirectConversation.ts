import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { conversationsQueryKey } from "@/features/chat/queries/queryKey";

export const useCreateDirectConversation = () => {
    const queryClient = useQueryClient();
    const organizationId = useOrganization().organization?.id ?? "";

    return useMutation({
        mutationFn: async (recipientUserId: string): Promise<Conversation> => {
            const res = await api.post(
                `/organizations/${organizationId}/conversations/direct`,
                { recipientUserId }
            );
            return res.data.conversation;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: conversationsQueryKey(organizationId),
            });
        },
    });
};
