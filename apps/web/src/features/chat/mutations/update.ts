import type { Message } from "@standin/contracts";
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

    return useOptimisticMessagesMutation<UpdateMessageInput, Message>({
        conversationId: (input) => input.conversationId,
        mutationFn: async ({ conversationId, messageId, content }) => {
            const res = await api.patch(
                `/organizations/${organizationId}/conversations/${conversationId}/messages/${messageId}`,
                { content }
            );
            return res.data.message;
        },
        // A message can only be edited from a row already rendered on
        // screen, so its conversation cache is guaranteed to be populated.
        apply: (data, { messageId, content }) => ({
            data: updateMessage(data!, messageId, (message) => ({
                ...message,
                content,
            })),
            meta: undefined,
        }),
        // The update endpoint only returns the bare Message row (content and
        // editedAt), so merge just those two fields instead of replacing
        // the cached message wholesale, which would wipe out its
        // attachments and any reaction change that landed meanwhile.
        reconcile: (data, message) =>
            updateMessage(data, message.id, (existing) => ({
                ...existing,
                content: message.content,
                editedAt: message.editedAt,
            })),
    });
};
