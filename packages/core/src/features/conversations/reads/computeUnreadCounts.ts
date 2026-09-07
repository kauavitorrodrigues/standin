import {
    db,
    conversationReadsTable,
    messagesTable,
    eq,
    and,
    or,
    isNull,
    inArray,
    ne,
    gt,
    sql,
} from "@standin/database";
import type { UnreadCounts } from "./getUnreadCounts";

// A message counts as unread when it wasn't sent by this user and its
// createdAt is past this user's lastReadAt for that conversation (no row
// at all means never read, so every message from someone else counts).
// Takes conversationIds already resolved by the caller (see
// findAccessibleConversations) instead of resolving them itself, so a
// caller that already has that list (listForUser) doesn't pay for it twice.
export const computeUnreadCounts = async (
    userId: string,
    conversationIds: string[]
): Promise<UnreadCounts> => {
    if (conversationIds.length === 0) return { counts: {}, total: 0 };

    const rows = await db
        .select({
            conversationId: messagesTable.conversationId,
            count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(messagesTable)
        .leftJoin(
            conversationReadsTable,
            and(
                eq(
                    conversationReadsTable.conversationId,
                    messagesTable.conversationId
                ),
                eq(conversationReadsTable.userId, userId)
            )
        )
        .where(
            and(
                inArray(messagesTable.conversationId, conversationIds),
                ne(messagesTable.senderId, userId),
                isNull(messagesTable.deletedAt),
                or(
                    isNull(conversationReadsTable.lastReadAt),
                    gt(messagesTable.createdAt, conversationReadsTable.lastReadAt)
                )
            )
        )
        .groupBy(messagesTable.conversationId);

    const counts = Object.fromEntries(
        rows.map((row) => [row.conversationId, row.count])
    );
    const total = rows.reduce((sum, row) => sum + row.count, 0);

    return { counts, total };
};
