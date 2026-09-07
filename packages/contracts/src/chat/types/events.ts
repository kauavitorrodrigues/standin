export const ChatEvents = {
    // Carries just enough to know what to refetch, never the message
    // itself, so the client falls back to the same REST fetch a manual
    // refresh would use.
    UNREAD_CHANGED: "chat:unread-changed",
    // Same "just enough to refetch" shape as UNREAD_CHANGED: the updated
    // seenBy comes from refetching the conversation's message list, not
    // from this payload.
    MESSAGE_SEEN: "chat:message-seen",
} as const;

export type ChatEvent = (typeof ChatEvents)[keyof typeof ChatEvents];

export type ChatUnreadChangedPayload = {
    conversationId: string;
};

export type ChatMessageSeenPayload = {
    conversationId: string;
};
