import type {
    ChatMessageCreatedPayload,
    ConversationsListResponse,
} from "@standin/contracts";

// Puts a new message into the cached conversation list: it becomes the last
// message and the count the server sent for this user replaces the old one.
// A conversation that is not in the list yet (a first direct message) cannot
// be built from the event, so the list is returned as it was and the caller
// fetches it.
export const applyMessageToConversations = (
    data: ConversationsListResponse | undefined,
    { conversationId, message, unreadCount }: ChatMessageCreatedPayload
): ConversationsListResponse | undefined => {
    if (!data) return data;

    // A reply kept in its thread is not the last message of the list, the
    // same rule the server applies when it lists conversations.
    const isHiddenReply =
        Boolean(message.threadParentId) && !message.showThreadReplyInChannel;

    return {
        ...data,
        conversations: data.conversations.map((conversation) =>
            conversation.id === conversationId
                ? {
                    ...conversation,
                    lastMessage: isHiddenReply
                        ? conversation.lastMessage
                        : {
                            id: message.id,
                            content: message.content,
                            senderId: message.senderId,
                            createdAt: message.createdAt,
                        },
                    unreadCount,
                }
                : conversation
        ),
    };
};
