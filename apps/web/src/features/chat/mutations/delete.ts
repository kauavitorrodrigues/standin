import { api } from "@/lib/axios/api";
import { DELETE_MESSAGE_TIMEOUT_MS } from "@/features/chat/consts/requests";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { messagesQueryKey } from "@/features/chat/queries";
import { removeMessage } from "@/features/chat/utils/messagesCache";
import { useOptimisticMessagesMutation } from "@/features/chat/mutations/useOptimisticMessagesMutation";

type DeleteMessageInput = {
    conversationId: string;
    messageId: string;
    threadParentId?: string;
    // The deleted message is a reply, so its parent loses one from its count.
    isThreadReply?: boolean;
};

export const useDeleteMessage = () => {
    const organizationId = useOrganization().organization?.id ?? "";

    return useOptimisticMessagesMutation<DeleteMessageInput, void>({
        conversationId: (input) => input.conversationId,
        threadParentId: (input) => input.threadParentId,
        // A deleted reply changes the count of its parent in the main list.
        onSuccess: (queryClient, _output, { conversationId, isThreadReply }) => {
            if (!isThreadReply) return;
            queryClient.invalidateQueries({
                queryKey: messagesQueryKey(conversationId),
                exact: true,
            });
        },
        mutationFn: async ({ conversationId, messageId }) => {
            await api.delete(
                `/organizations/${organizationId}/conversations/${conversationId}/messages/${messageId}`,
                { timeout: DELETE_MESSAGE_TIMEOUT_MS }
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
