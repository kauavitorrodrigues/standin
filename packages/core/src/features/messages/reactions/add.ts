import { db, messageReactionsTable, eq, and } from "@standin/database";
import { assertMessageInConversation } from "../utils/assertMessageInConversation";
import { serializeReaction } from "../utils/serializeReaction";

const reactionReturning = {
    emoji: messageReactionsTable.emoji,
    userId: messageReactionsTable.userId,
    createdAt: messageReactionsTable.createdAt,
};

export const addReaction = async (
    conversationId: string,
    messageId: string,
    userId: string,
    emoji: string
) => {
    await assertMessageInConversation(messageId, conversationId);

    const [inserted] = await db
        .insert(messageReactionsTable)
        .values({ messageId, userId, emoji })
        .onConflictDoNothing({
            target: [
                messageReactionsTable.messageId,
                messageReactionsTable.userId,
                messageReactionsTable.emoji,
            ],
        })
        .returning(reactionReturning);

    if (inserted) return serializeReaction(inserted);

    // Already reacted with this exact emoji, so the insert above was a
    // no-op: read back the existing row instead of writing the same value
    // again.
    const [existing] = await db
        .select(reactionReturning)
        .from(messageReactionsTable)
        .where(
            and(
                eq(messageReactionsTable.messageId, messageId),
                eq(messageReactionsTable.userId, userId),
                eq(messageReactionsTable.emoji, emoji)
            )
        );

    return serializeReaction(existing);
};
