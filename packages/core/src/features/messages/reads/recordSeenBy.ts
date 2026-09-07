import {
    db,
    messagesTable,
    messageReadsTable,
    eq,
    and,
    ne,
    isNull,
    type Transaction,
} from "@standin/database";

// One bulk insert for every unseen message, never one row per message per
// markAsRead call. That doesn't scale once a conversation has real history.
export const recordMessagesSeenBy = async (
    conversationId: string,
    userId: string,
    tx: Transaction | typeof db = db
): Promise<void> => {
    const unseenMessages = await tx
        .select({ id: messagesTable.id })
        .from(messagesTable)
        .leftJoin(
            messageReadsTable,
            and(
                eq(messageReadsTable.messageId, messagesTable.id),
                eq(messageReadsTable.userId, userId)
            )
        )
        .where(
            and(
                eq(messagesTable.conversationId, conversationId),
                ne(messagesTable.senderId, userId),
                isNull(messagesTable.deletedAt),
                isNull(messageReadsTable.id)
            )
        );

    if (unseenMessages.length === 0) return;

    await tx
        .insert(messageReadsTable)
        .values(unseenMessages.map(({ id }) => ({ messageId: id, userId })))
        .onConflictDoNothing();
};
