import { markConversationAsRead } from "./markAsRead";
import { getUnreadCounts } from "./unreadCounts";

export const ReadController = {
    markAsRead: markConversationAsRead,
    unreadCounts: getUnreadCounts,
};
