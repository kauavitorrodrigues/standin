import { db, conversationsTable, eq, and, isNull } from "@standin/database";
import { ConversationNotFoundError } from "@standin/contracts";

export const findConversationById = async (
    conversationId: string,
    organizationId: string
): Promise<{ id: string; organizationId: string }> => {
    const [conversation] = await db
        .select({
            id: conversationsTable.id,
            organizationId: conversationsTable.organizationId,
        })
        .from(conversationsTable)
        .where(
            and(
                eq(conversationsTable.id, conversationId),
                isNull(conversationsTable.deletedAt)
            )
        );

    if (!conversation || conversation.organizationId !== organizationId) {
        throw new ConversationNotFoundError();
    }

    return conversation;
};
