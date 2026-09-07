import {
    db,
    conversationsTable,
    conversationParticipantsTable,
    eq,
    and,
    isNull,
    sql,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import {
    CONVERSATION_TYPES,
    SelfConversationNotAllowedError,
    ConversationRecipientAccessDeniedError,
} from "@standin/contracts";
import type { Conversation } from "@standin/contracts";
import { OrganizationService } from "../organizations";

// A DIRECT conversation matches this pair only when it has exactly these
// two active participants and nobody else. Matching on "both are members"
// alone would also match a group conversation that happens to include both.
// Dedup is app-level, not a DB constraint.
const findExistingDirectConversation = async (
    tx: Transaction,
    organizationId: string,
    userAId: string,
    userBId: string
): Promise<{ id: string } | null> => {
    const [existing] = await tx
        .select({
            conversationId: conversationParticipantsTable.conversationId,
        })
        .from(conversationParticipantsTable)
        .innerJoin(
            conversationsTable,
            eq(
                conversationsTable.id,
                conversationParticipantsTable.conversationId
            )
        )
        .where(
            and(
                eq(conversationsTable.type, CONVERSATION_TYPES.DIRECT),
                eq(conversationsTable.organizationId, organizationId),
                isNull(conversationsTable.deletedAt),
                isNull(conversationParticipantsTable.deletedAt)
            )
        )
        .groupBy(conversationParticipantsTable.conversationId)
        .having(
            sql`count(*) = 2 and count(*) filter (where ${conversationParticipantsTable.userId} in (${userAId}, ${userBId})) = 2`
        );

    return existing ? { id: existing.conversationId } : null;
};

export const findOrCreateDirectConversation = async (
    organizationId: string,
    userAId: string,
    userBId: string
): Promise<Conversation> => {
    if (userAId === userBId) throw new SelfConversationNotAllowedError();

    const recipientIsActiveMember =
        await OrganizationService.hasActiveMembership(userBId, organizationId);

    if (!recipientIsActiveMember) {
        throw new ConversationRecipientAccessDeniedError();
    }

    // Lookup and insert run inside the same transaction, serialized by a
    // pg_advisory_xact_lock keyed on the ordered pair + organization. Two
    // concurrent calls for the same pair now block on each other instead of
    // racing: the second one only proceeds (and sees the first one's insert
    // via the lookup) after the first transaction commits and releases the
    // lock. No DB-level uniqueness needed (dedup stays app-level).
    const [userLo, userHi] = [userAId, userBId].sort();

    const conversation = await db.transaction(async (tx) => {
        await tx.execute(
            sql`select pg_advisory_xact_lock(hashtext(${`${organizationId}:${userLo}:${userHi}`}))`
        );

        const existing = await findExistingDirectConversation(
            tx,
            organizationId,
            userAId,
            userBId
        );
        if (existing) return existing;

        const [created] = await tx
            .insert(conversationsTable)
            .values({ type: CONVERSATION_TYPES.DIRECT, organizationId })
            .returning({ id: conversationsTable.id });

        await tx.insert(conversationParticipantsTable).values([
            { conversationId: created.id, userId: userAId },
            { conversationId: created.id, userId: userBId },
        ]);

        return created;
    });

    return { id: conversation.id, type: CONVERSATION_TYPES.DIRECT };
};
