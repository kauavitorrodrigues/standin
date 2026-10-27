import type { QueryClient } from "@tanstack/react-query";
import type { ChatMessageCreatedPayload } from "@standin/contracts";
import {
    messagesQueryKey,
    threadMessagesQueryKey,
} from "@/features/chat/queries/queryKey";
import {
    applyThreadSummary,
    prependMessage,
    type MessagesData,
} from "@/features/chat/utils/messagesCache";

// Puts a message someone else sent into the message caches that are open. A
// top-level message goes to the main list. A reply goes to its thread list,
// moves the count and last reply of its parent in the main list, and also
// enters the main list when it asked to be shown in the channel. A list that
// was never opened has no cache: it is fetched when it is.
export const applyCreatedMessageToMessages = (
    queryClient: QueryClient,
    { conversationId, message, sender, threadSummary }: ChatMessageCreatedPayload
): void => {
    const withSeenBy = { ...message, seenBy: [] };
    const mainKey = messagesQueryKey(conversationId);
    const { threadParentId } = message;

    if (threadParentId) {
        const threadKey = threadMessagesQueryKey(conversationId, threadParentId);
        if (queryClient.getQueryData(threadKey)) {
            queryClient.setQueryData<MessagesData>(threadKey, (data) =>
                prependMessage(data, withSeenBy, sender)
            );
        }
    }

    if (!queryClient.getQueryData(mainKey)) return;

    queryClient.setQueryData<MessagesData>(mainKey, (data) => {
        if (!data) return data;
        const withSummary = threadSummary
            ? applyThreadSummary(data, threadSummary)
            : data;
        const isHiddenReply =
            Boolean(threadParentId) && !message.showThreadReplyInChannel;
        if (isHiddenReply) return withSummary;
        return prependMessage(withSummary, withSeenBy, sender);
    });
};
