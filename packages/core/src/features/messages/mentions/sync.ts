import { db, messageMentionsTable, and, eq, inArray } from "@standin/database";
import type { Transaction } from "@standin/database";

type Executor = Transaction | typeof db;

export const insertMentions = async (
    messageId: string,
    userIds: string[],
    tx: Executor = db
): Promise<void> => {
    if (userIds.length === 0) return;

    await tx
        .insert(messageMentionsTable)
        .values(userIds.map((userId) => ({ messageId, userId })))
        .onConflictDoNothing();
};

export const listMentionedUserIds = async (
    messageId: string,
    tx: Executor = db
): Promise<string[]> => {
    const rows = await tx
        .select({ userId: messageMentionsTable.userId })
        .from(messageMentionsTable)
        .where(eq(messageMentionsTable.messageId, messageId));

    return rows.map((row) => row.userId);
};

export const deleteMentions = async (
    messageId: string,
    userIds: string[],
    tx: Executor = db
): Promise<void> => {
    if (userIds.length === 0) return;

    await tx
        .delete(messageMentionsTable)
        .where(
            and(
                eq(messageMentionsTable.messageId, messageId),
                inArray(messageMentionsTable.userId, userIds)
            )
        );
};
