import type { MessageWithDetails } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { updateMessage } from "@/features/chat/utils/messagesCache";
import { useOptimisticMessagesMutation } from "@/features/chat/mutations/useOptimisticMessagesMutation";

type UpdateMessageInput = {
    conversationId: string;
    messageId: string;
    content: string;
};

export const useUpdateMessage = () => {
    const organizationId = useOrganization().organization?.id ?? "";

    return useOptimisticMessagesMutation<
        UpdateMessageInput,
        MessageWithDetails
    >({
        conversationId: (input) => input.conversationId,
        mutationFn: async ({ conversationId, messageId, content }) => {
            const res = await api.patch(
                `/organizations/${organizationId}/conversations/${conversationId}/messages/${messageId}`,
                { content }
            );
            return res.data.message;
        },
        // A message can only be edited from a row already rendered on
        // screen, so its conversation cache is guaranteed to be populated
        // (same invariant as the reaction toggle mutation).
        apply: (data, { messageId, content }) => ({
            data: updateMessage(data!, messageId, (message) => ({
                ...message,
                content,
            })),
            meta: undefined,
        }),
        reconcile: (data, message) =>
            updateMessage(data, message.id, () => message),
    });
};
