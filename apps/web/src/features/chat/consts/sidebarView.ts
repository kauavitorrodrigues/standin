export const CHAT_SIDEBAR_VIEWS = {
    LIST: "list",
    THREAD: "thread",
    PARTICIPANTS: "participants",
    NEW_CONVERSATION: "newConversation",
} as const;

export type ChatSidebarView =
    (typeof CHAT_SIDEBAR_VIEWS)[keyof typeof CHAT_SIDEBAR_VIEWS];
