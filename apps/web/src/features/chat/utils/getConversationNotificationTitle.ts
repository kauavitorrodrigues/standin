import { CONVERSATION_TYPES, type ConversationSummary } from "@standin/contracts";

// Direct conversations are named after the other person. A space
// conversation resolves its name from the space, which a notification does
// not have at hand.
export const getConversationNotificationTitle = (
    conversation: ConversationSummary
): string =>
    conversation.type === CONVERSATION_TYPES.DIRECT
        ? (conversation.participants[0]?.name ?? "Nova mensagem")
        : "Nova mensagem no espaço";
