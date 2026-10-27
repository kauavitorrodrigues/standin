import type { ConversationSummary } from "@standin/contracts";

// Conversations with unread messages come first, and each group is ordered
// by the last message, newest first. Returns a new array.
export const sortConversationSummaries = (
    summaries: ConversationSummary[]
): ConversationSummary[] =>
    [...summaries].sort((a, b) => {
        const aUnread = a.unreadCount > 0;
        const bUnread = b.unreadCount > 0;
        if (aUnread !== bUnread) return aUnread ? -1 : 1;

        const aTime = a.lastMessage?.createdAt ?? "";
        const bTime = b.lastMessage?.createdAt ?? "";
        return bTime.localeCompare(aTime);
    });
