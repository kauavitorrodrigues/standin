export const CONVERSATION_MESSAGES_QUERY_KEY = "conversationMessages";

export const messagesQueryKey = (conversationId: string) =>
    [CONVERSATION_MESSAGES_QUERY_KEY, conversationId] as const;

export type MessagesQueryKey = ReturnType<typeof messagesQueryKey>;

export const UNREAD_COUNTS_QUERY_KEY = "conversationUnreadCounts";

export const unreadCountsQueryKey = (organizationId: string) =>
    [UNREAD_COUNTS_QUERY_KEY, organizationId] as const;

export const CONVERSATIONS_QUERY_KEY = "conversations";

export const conversationsQueryKey = (organizationId: string) =>
    [CONVERSATIONS_QUERY_KEY, organizationId] as const;
