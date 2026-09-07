import { markConversationAsRead } from "./markAsRead";
import { getUnreadCounts } from "./getUnreadCounts";

export const ConversationReadService = {
    markAsRead: markConversationAsRead,
    getUnreadCounts,
};

export type { UnreadCounts } from "./getUnreadCounts";
