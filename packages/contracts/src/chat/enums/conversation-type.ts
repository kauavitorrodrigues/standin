export const CONVERSATION_TYPES = {
    SPACE: "SPACE",
    DIRECT: "DIRECT",
} as const;

export type ConversationType =
    (typeof CONVERSATION_TYPES)[keyof typeof CONVERSATION_TYPES];
