import { db, messageReactionsTable } from "@standin/database";
import { assertMessageInConversation } from "../utils/assertMessageInConversation";
import { serializeReaction } from "../utils/serializeReaction";

export const addReaction = async (
    conversationId: string,
    messageId: string,
    userId: string,
    emoji: string
) => {
    await assertMessageInConversation(messageId, conversationId);

    const [row] = await db
        .insert(messageReactionsTable)
        .values({ messageId, userId, emoji })
        .onConflictDoUpdate({
            target: [
                messageReactionsTable.messageId,
                messageReactionsTable.userId,
                messageReactionsTable.emoji,
            ],
            set: { emoji },
        })
        .returning({
            emoji: messageReactionsTable.emoji,
            userId: messageReactionsTable.userId,
            createdAt: messageReactionsTable.createdAt,
        });

    return serializeReaction(row);
};
