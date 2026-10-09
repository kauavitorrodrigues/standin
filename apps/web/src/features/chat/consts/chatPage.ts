export const CHAT_PAGE_MODES = {
    THREAD: "thread",
    PARTICIPANTS: "participants",
    NEW_CONVERSATION: "newConversation",
} as const;

export type ChatPageMode =
    (typeof CHAT_PAGE_MODES)[keyof typeof CHAT_PAGE_MODES];
