import { listConversations } from "./list";
import { createDirectConversation } from "./createDirect";

export const ConversationController = {
    list: listConversations,
    createDirect: createDirectConversation,
};
