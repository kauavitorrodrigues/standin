import type { UnreadCounts } from "@standin/contracts";

// Puts the count the server sent for one conversation into the cached counts.
// The server's total is always the sum of its counts, so the total is rebuilt
// from the counts here instead of moved by a difference, and it can never
// drift from them. With no cache yet there is nothing to patch: the first
// fetch brings the right numbers.
export const applyUnreadCount = (
    data: UnreadCounts | undefined,
    conversationId: string,
    unreadCount: number
): UnreadCounts | undefined => {
    if (!data) return data;

    const counts = { ...data.counts, [conversationId]: unreadCount };
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return { counts, total };
};
