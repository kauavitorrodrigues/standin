export const CONVERSATION_MESSAGES_QUERY_KEY = "conversationMessages";

export const messagesQueryKey = (conversationId: string) =>
    [CONVERSATION_MESSAGES_QUERY_KEY, conversationId] as const;

export type MessagesQueryKey = ReturnType<typeof messagesQueryKey>;
