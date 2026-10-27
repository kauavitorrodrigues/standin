import {
    db,
    usersTable,
    conversationReadsTable,
    messagesTable,
    eq,
    and,
    isNull,
    inArray,
    ne,
    gt,
    sql,
} from "@standin/database";

// How many unread messages each of these users has in one conversation, in a
// fixed number of queries for the whole batch instead of one per user. The same
// rule as computeUnreadCounts: not sent by the user, not deleted, and past the
// user's lastReadAt (no read row means never read). Everyone asked about is in
// the answer, with 0 when nothing is unread.
//
// Whoever read the conversation before is counted over the messages past their
// lastReadAt, which is as many as they have unread. Whoever never read it has
// everything unread, so it is the total of the conversation minus their own,
// taken from a single count by sender instead of a join with the history per
// user.
export const countUnreadForUsers = async (
    conversationId: string,
    userIds: string[]
): Promise<Record<string, number>> => {
    if (userIds.length === 0) return {};

    const rows = await db
        .select({
            userId: usersTable.id,
            lastReadAt: sql<Date | null>`min(
                ${conversationReadsTable.lastReadAt}
            )`,
            count: sql<number>`count(${messagesTable.id})`.mapWith(Number),
        })
        .from(usersTable)
        .leftJoin(
            conversationReadsTable,
            and(
                eq(conversationReadsTable.userId, usersTable.id),
                eq(conversationReadsTable.conversationId, conversationId)
            )
        )
        .leftJoin(
            messagesTable,
            and(
                eq(messagesTable.conversationId, conversationId),
                ne(messagesTable.senderId, usersTable.id),
                isNull(messagesTable.deletedAt),
                gt(messagesTable.createdAt, conversationReadsTable.lastReadAt)
            )
        )
        .where(inArray(usersTable.id, userIds))
        .groupBy(usersTable.id);

    const counts: Record<string, number> = {};
    const neverRead: string[] = [];
    for (const row of rows) {
        counts[row.userId] = row.count;
        if (row.lastReadAt === null) neverRead.push(row.userId);
    }
    if (neverRead.length === 0) return counts;

    const bySender = await db
        .select({
            senderId: messagesTable.senderId,
            count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(messagesTable)
        .where(
            and(
                eq(messagesTable.conversationId, conversationId),
                isNull(messagesTable.deletedAt)
            )
        )
        .groupBy(messagesTable.senderId);

    const total = bySender.reduce((sum, { count }) => sum + count, 0);
    const sent = new Map(
        bySender.map(({ senderId, count }) => [senderId, count])
    );
    for (const userId of neverRead) {
        counts[userId] = total - (sent.get(userId) ?? 0);
    }
    return counts;
};
