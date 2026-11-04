import {
    db,
    messageMentionsTable,
    usersTable,
    eq,
    inArray,
} from "@standin/database";
import { REMOVED_MENTION_NAME } from "./consts";
import type { MentionRow } from "./types";

const currentName = (row: { name: string; deletedAt: Date | null }): string => {
    if (row.deletedAt) return REMOVED_MENTION_NAME;
    return row.name;
};

// The mentions of a whole page of messages in one query, with the name each
// person has now.
export const listMentionsByMessageIds = async (
    messageIds: string[]
): Promise<MentionRow[]> => {
    if (messageIds.length === 0) return [];

    const rows = await db
        .select({
            messageId: messageMentionsTable.messageId,
            userId: messageMentionsTable.userId,
            name: usersTable.name,
            deletedAt: usersTable.deletedAt,
        })
        .from(messageMentionsTable)
        .innerJoin(usersTable, eq(usersTable.id, messageMentionsTable.userId))
        .where(inArray(messageMentionsTable.messageId, messageIds))
        .orderBy(messageMentionsTable.createdAt);

    return rows.map((row) => ({
        messageId: row.messageId,
        userId: row.userId,
        name: currentName(row),
    }));
};
