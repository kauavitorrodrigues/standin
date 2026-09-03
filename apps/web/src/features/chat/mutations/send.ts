import type { MessageWithDetails } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
    prependMessage,
    updateMessage,
} from "@/features/chat/utils/messagesCache";
import { useOptimisticMessagesMutation } from "@/features/chat/mutations/useOptimisticMessagesMutation";
import { OPTIMISTIC_MESSAGE_ID_PREFIX } from "@/features/chat/consts/messages";

type SendMessageInput = {
    conversationId: string;
    content: string;
    attachments?: File[];
};

const buildOptimisticMessage = (
    { conversationId, content }: SendMessageInput,
    senderId: string
): MessageWithDetails => ({
    id: `${OPTIMISTIC_MESSAGE_ID_PREFIX}${crypto.randomUUID()}`,
    conversationId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    editedAt: null,
    attachments: [],
    reactions: [],
});

export const useSendMessage = () => {
    const { user } = useAuth();
    const organizationId = useOrganization().organization?.id ?? "";

    return useOptimisticMessagesMutation<
        SendMessageInput,
        MessageWithDetails,
        string
    >({
        conversationId: (input) => input.conversationId,
        mutationFn: async ({ conversationId, content, attachments }) => {
            const formData = new FormData();
            formData.append("content", content);
            for (const file of attachments ?? []) {
                formData.append("attachments", file);
            }

            const res = await api.post(
                `/organizations/${organizationId}/conversations/${conversationId}/messages`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.message;
        },
        apply: (data, input) => {
            const optimisticMessage = buildOptimisticMessage(input, user.id);
            return {
                data: prependMessage(data, optimisticMessage),
                meta: optimisticMessage.id,
            };
        },
        reconcile: (data, message, _input, optimisticId) =>
            updateMessage(data, optimisticId, () => message),
    });
};
