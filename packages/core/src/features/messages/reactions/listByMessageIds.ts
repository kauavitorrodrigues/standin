import { messageReactionSelect } from "../consts";
import { db, messageReactionsTable, inArray } from "@standin/database";
import type { ReactionRow } from "./types";

export const listReactionsByMessageIds = async (
    messageIds: string[]
): Promise<ReactionRow[]> => {
    if (messageIds.length === 0) return [];

    return db
        .select(messageReactionSelect)
        .from(messageReactionsTable)
        .where(inArray(messageReactionsTable.messageId, messageIds))
        .orderBy(messageReactionsTable.createdAt);
};
