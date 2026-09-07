import { db, conversationsTable, eq, and, isNull } from "@standin/database";
import {
    ConversationNotFoundError,
    CONVERSATION_TYPES,
} from "@standin/contracts";

export const findConversationBySpaceId = async (
    spaceId: string
): Promise<{ id: string }> => {
    const [conversation] = await db
        .select({ id: conversationsTable.id })
        .from(conversationsTable)
        .where(
            and(
                eq(conversationsTable.spaceId, spaceId),
                eq(conversationsTable.type, CONVERSATION_TYPES.SPACE),
                isNull(conversationsTable.deletedAt)
            )
        );

    if (!conversation) throw new ConversationNotFoundError();
    return conversation;
};
