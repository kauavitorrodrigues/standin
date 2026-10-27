import {
    db,
    conversationsTable,
    conversationParticipantsTable,
    eq,
    and,
    isNull,
    sql,
    inArray,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import {
    CONVERSATION_TYPES,
    DirectConversationTooLargeError,
    MAX_DIRECT_CONVERSATION_MEMBERS,
    ConversationRecipientAccessDeniedError,
} from "@standin/contracts";
import type { Conversation } from "@standin/contracts";
import { OrganizationService } from "../organizations";

// A DIRECT conversation matches a member set only when its active
// participants are exactly that set. Matching on "all are members" alone
// would also match a bigger group that happens to include them. A set of one
// is the conversation with yourself. Dedup is app-level, not a DB constraint.
const findExistingDirectConversation = async (
    tx: Transaction,
    organizationId: string,
    memberIds: string[]
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
            sql`count(*) = ${memberIds.length} and count(*) filter (where ${inArray(conversationParticipantsTable.userId, memberIds)}) = ${memberIds.length}`
        );

    return existing ? { id: existing.conversationId } : null;
};

export const findOrCreateDirectConversation = async (
    organizationId: string,
    creatorId: string,
    recipientUserIds: string[]
): Promise<Conversation> => {
    // The creator is always a member, and a repeated id is the same person.
    const memberIds = [...new Set([creatorId, ...recipientUserIds])].sort();

    // Same cap as the contract, since core can be called without it.
    if (memberIds.length > MAX_DIRECT_CONVERSATION_MEMBERS) {
        throw new DirectConversationTooLargeError();
    }

    for (const memberId of memberIds) {
        if (memberId === creatorId) continue;

        const isActiveMember = await OrganizationService.hasActiveMembership(
            memberId,
            organizationId
        );
        if (!isActiveMember) throw new ConversationRecipientAccessDeniedError();
    }

    // Lookup and insert run inside the same transaction, serialized by a
    // pg_advisory_xact_lock keyed on the sorted member set + organization.
    // Two concurrent calls for the same set block on each other instead of
    // racing: the second one only proceeds (and sees the first one's insert
    // via the lookup) after the first transaction commits and releases the
    // lock. No DB-level uniqueness needed (dedup stays app-level).
    const conversation = await db.transaction(async (tx) => {
        await tx.execute(
            sql`select pg_advisory_xact_lock(hashtext(${`${organizationId}:${memberIds.join(":")}`}))`
        );

        const existing = await findExistingDirectConversation(
            tx,
            organizationId,
            memberIds
        );
        if (existing) return existing;

        const [created] = await tx
            .insert(conversationsTable)
            .values({ type: CONVERSATION_TYPES.DIRECT, organizationId })
            .returning({ id: conversationsTable.id });

        await tx.insert(conversationParticipantsTable).values(
            memberIds.map((userId) => ({
                conversationId: created.id,
                userId,
            }))
        );

        return created;
    });

    return { id: conversation.id, type: CONVERSATION_TYPES.DIRECT };
};
