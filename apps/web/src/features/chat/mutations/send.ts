import type { MessageWithDetails, ThreadSummary } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { messagesQueryKey } from "@/features/chat/queries";
import {
    applyThreadSummary,
    prependMessage,
    updateMessage,
    type MessagesData,
} from "@/features/chat/utils/messagesCache";
import { useOptimisticMessagesMutation } from "@/features/chat/mutations/useOptimisticMessagesMutation";
import {
    buildTempMessage,
    createOptimisticMessageId,
} from "@/features/chat/utils/tempMessage";

type SendMessageInput = {
    conversationId: string;
    content?: string;
    attachments?: File[];
    // Makes the message a reply of that top-level message.
    threadParentId?: string;
    // A reply also shown in the main list.
    showThreadReplyInChannel?: boolean;
};

type SendMessageOutput = {
    message: MessageWithDetails;
    threadSummary: ThreadSummary | null;
};

const buildOptimisticMessage = (
    {
        conversationId,
        content,
        threadParentId,
        showThreadReplyInChannel,
    }: SendMessageInput,
    senderId: string
): MessageWithDetails =>
    buildTempMessage({
        id: createOptimisticMessageId(),
        conversationId,
        senderId,
        content: content ?? null,
        threadParentId,
        showThreadReplyInChannel,
    });

export const useSendMessage = () => {
    const { user } = useAuth();
    const organizationId = useOrganization().organization?.id ?? "";

    return useOptimisticMessagesMutation<
        SendMessageInput,
        SendMessageOutput,
        string
    >({
        conversationId: (input) => input.conversationId,
        threadParentId: (input) => input.threadParentId,
        mutationFn: async ({
            conversationId,
            content,
            attachments,
            threadParentId,
            showThreadReplyInChannel,
        }) => {
            const formData = new FormData();
            if (content) formData.append("content", content);
            if (threadParentId) {
                formData.append("threadParentId", threadParentId);
                formData.append(
                    "showThreadReplyInChannel",
                    String(showThreadReplyInChannel === true)
                );
            }
            for (const file of attachments ?? []) {
                formData.append("attachments", file);
            }

            const res = await api.post(
                `/organizations/${organizationId}/conversations/${conversationId}/messages`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        apply: (data, input) => {
            const optimisticMessage = buildOptimisticMessage(input, user.id);
            return {
                data: prependMessage(data, optimisticMessage),
                meta: optimisticMessage.id,
            };
        },
        reconcile: (data, { message }, _input, optimisticId) =>
            updateMessage(data, optimisticId, () => message),
        // A reply lives in its thread list, so the main list is updated here:
        // the parent shows its new count, and the reply itself shows up when
        // it asked to be in the channel.
        onSuccess: (queryClient, { message, threadSummary }, input) => {
            if (!input.threadParentId) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(input.conversationId),
                (data) => {
                    if (!data) return data;
                    const withSummary = threadSummary
                        ? applyThreadSummary(data, threadSummary)
                        : data;
                    return message.showThreadReplyInChannel
                        ? prependMessage(withSummary, message)
                        : withSummary;
                }
            );
        },
    });
};
