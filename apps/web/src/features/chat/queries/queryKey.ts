export const CONVERSATION_MESSAGES_QUERY_KEY = "conversationMessages";

export const messagesQueryKey = (conversationId: string) =>
    [CONVERSATION_MESSAGES_QUERY_KEY, conversationId] as const;

// Under the conversation key, so a prefix match reaches the main list and every
// open thread of that conversation.
export const threadMessagesQueryKey = (
    conversationId: string,
    threadParentId: string
) => [...messagesQueryKey(conversationId), "thread", threadParentId] as const;

// The list of the conversation, or of one thread of it.
export const messagesListQueryKey = (
    conversationId: string,
    threadParentId?: string
) =>
    threadParentId
        ? threadMessagesQueryKey(conversationId, threadParentId)
        : messagesQueryKey(conversationId);

export type MessagesQueryKey = ReturnType<typeof messagesListQueryKey>;

export const UNREAD_COUNTS_QUERY_KEY = "conversationUnreadCounts";

export const unreadCountsQueryKey = (organizationId: string) =>
    [UNREAD_COUNTS_QUERY_KEY, organizationId] as const;

export const CONVERSATIONS_QUERY_KEY = "conversations";

export const conversationsQueryKey = (organizationId: string) =>
    [CONVERSATIONS_QUERY_KEY, organizationId] as const;

// Under the list key, so invalidating the list refreshes the searches too.
export const conversationsSearchQueryKey = (
    organizationId: string,
    search: string
) => [...conversationsQueryKey(organizationId), "search", search] as const;
