import { db, conversationsTable, eq, and, isNull } from "@standin/database";
import {
    assertConversationAccessible,
    type ConversationRow,
} from "./utils/assertAccessible";

export const findConversationById = async (
    conversationId: string,
    organizationId: string
): Promise<ConversationRow> => {
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

    return assertConversationAccessible(conversation, organizationId);
};
