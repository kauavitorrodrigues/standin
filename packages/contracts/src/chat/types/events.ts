import type { MessageSender } from "./message-sender";
import type { MessageWithDetails } from "./message-with-details";
import type { ThreadSummary } from "./thread-summary";

export const ChatEvents = {
    // Just enough to know what to refetch: the updated seenBy comes from
    // refetching the conversation's message list, not from this payload.
    MESSAGE_SEEN: "chat:message-seen",
    // The next five carry what happened, sent by the server after it saved
    // it. The sender never receives them: the screen of the sender already
    // shows what they did.
    MESSAGE_CREATED: "chat:message-created",
    MESSAGE_UPDATED: "chat:message-updated",
    MESSAGE_DELETED: "chat:message-deleted",
    REACTION_TOGGLED: "chat:reaction-toggled",
    TYPING: "chat:typing",
} as const;

export type ChatEvent = (typeof ChatEvents)[keyof typeof ChatEvents];

export type ChatMessageSeenPayload = {
    conversationId: string;
};

// Nobody has seen a message that was just created, so `seenBy` is left out.
// `unreadCount` is the recipient's own unread total for this conversation,
// this message included, so the client shows the badge with no refetch.
export type ChatMessageCreatedPayload = {
    conversationId: string;
    message: Omit<MessageWithDetails, "seenBy">;
    sender: MessageSender;
    unreadCount: number;
    // Only for a thread reply: the parent's new count and last reply.
    threadSummary: ThreadSummary | null;
};

export type ChatMessageUpdatedPayload = {
    conversationId: string;
    messageId: string;
    userId: string;
    content: string | null;
    editedAt: string;
};

export type ChatMessageDeletedPayload = {
    conversationId: string;
    messageId: string;
    userId: string;
};

export type ChatReactionToggledPayload = {
    conversationId: string;
    messageId: string;
    emoji: string;
    userId: string;
    added: boolean;
};

// What the client sends: the person is the one the socket authenticated.
export type ChatTypingInput = {
    conversationId: string;
    isTyping: boolean;
    // For a connection that is not in a space. In one, the space decides.
    organizationId?: string;
};

export type ChatTypingPayload = ChatTypingInput & {
    userId: string;
    userName: string;
};
