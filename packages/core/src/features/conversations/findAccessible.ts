import {
    db,
    conversationsTable,
    conversationParticipantsTable,
    eq,
    and,
    or,
    isNull,
    sql,
} from "@standin/database";
import { CONVERSATION_TYPES, type ConversationType } from "@standin/contracts";

export type AccessibleConversation = {
    id: string;
    type: ConversationType;
    spaceId: string | null;
};

// SPACE conversations are accessible to every active org member (see
// canAccessConversation) regardless of any conversation_participants row;
// DIRECT conversations require an active participant row for this user.
// Shared by getUnreadCounts and listForUser so the accessibility rule only
// lives in one place.
export const findAccessibleConversations = async (
    userId: string,
    organizationId: string
): Promise<AccessibleConversation[]> => {
    return db
        .select({
            id: conversationsTable.id,
            type: conversationsTable.type,
            spaceId: conversationsTable.spaceId,
        })
        .from(conversationsTable)
        .leftJoin(
            conversationParticipantsTable,
            and(
                eq(
                    conversationParticipantsTable.conversationId,
                    conversationsTable.id
                ),
                eq(conversationParticipantsTable.userId, userId),
                isNull(conversationParticipantsTable.deletedAt)
            )
        )
        .where(
            and(
                eq(conversationsTable.organizationId, organizationId),
                isNull(conversationsTable.deletedAt),
                or(
                    eq(conversationsTable.type, CONVERSATION_TYPES.SPACE),
                    and(
                        eq(conversationsTable.type, CONVERSATION_TYPES.DIRECT),
                        sql`${conversationParticipantsTable.id} is not null`
                    )
                )
            )
        );
};
