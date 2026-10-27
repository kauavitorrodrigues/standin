import { getDirectConversationTitle } from "@/features/chat/utils/getDirectConversationTitle";
import { CONVERSATION_TYPES, type ConversationSummary } from "@standin/contracts";

// Direct conversations are named after the other people in them. A space
// conversation resolves its name from the space, which a notification does
// not have at hand.
export const getConversationNotificationTitle = (
    conversation: ConversationSummary
): string =>
    conversation.type === CONVERSATION_TYPES.DIRECT
        ? getDirectConversationTitle(conversation.participants)
        : "Nova mensagem no espaço";
