import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { removeMessage } from "@/features/chat/utils/messagesCache";
import { useOptimisticMessagesMutation } from "@/features/chat/mutations/useOptimisticMessagesMutation";

type DeleteMessageInput = { conversationId: string; messageId: string };

export const useDeleteMessage = () => {
    const organizationId = useOrganization().organization?.id ?? "";

    return useOptimisticMessagesMutation<DeleteMessageInput, void>({
        conversationId: (input) => input.conversationId,
        mutationFn: async ({ conversationId, messageId }) => {
            await api.delete(
                `/organizations/${organizationId}/conversations/${conversationId}/messages/${messageId}`
            );
        },
        // Same invariant as the reaction toggle and update mutations: a
        // message can only be deleted from a row already rendered on screen.
        apply: (data, { messageId }) => ({
            data: removeMessage(data!, messageId),
            meta: undefined,
        }),
    });
};
