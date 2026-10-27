import { markConversationAsRead } from "./markAsRead";
import { getUnreadCounts } from "./getUnreadCounts";
import { countUnreadForUsers } from "./countUnreadForUsers";

export const ConversationReadService = {
    markAsRead: markConversationAsRead,
    getUnreadCounts,
    countUnreadForUsers,
};

export type { UnreadCounts } from "./getUnreadCounts";
