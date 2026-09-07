import { db, messageReactionsTable, eq, and } from "@standin/database";
import { assertMessageInConversation } from "../utils/assertMessageInConversation";

export const removeReaction = async (
    conversationId: string,
    messageId: string,
    userId: string,
    emoji: string
) => {
    await assertMessageInConversation(messageId, conversationId);

    await db
        .delete(messageReactionsTable)
        .where(
            and(
                eq(messageReactionsTable.messageId, messageId),
                eq(messageReactionsTable.userId, userId),
                eq(messageReactionsTable.emoji, emoji)
            )
        );
};
