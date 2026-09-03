import {
    db,
    conversationsTable,
    conversationParticipantsTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import {
    ConversationNotFoundError,
    CONVERSATION_TYPES,
    type ConversationType,
} from "@standin/contracts";
import { OrganizationService } from "../organizations";

type ConversationAccessContext = {
    userId: string;
    conversationId: string;
    organizationId: string;
};

const canAccessSpaceConversation = ({
    userId,
    organizationId,
}: ConversationAccessContext): Promise<boolean> =>
    OrganizationService.hasActiveMembership(userId, organizationId);

const canAccessDirectConversation = async (
    context: ConversationAccessContext
): Promise<boolean> => {
    const [participant] = await db
        .select({ id: conversationParticipantsTable.id })
        .from(conversationParticipantsTable)
        .where(
            and(
                eq(
                    conversationParticipantsTable.conversationId,
                    context.conversationId
                ),
                eq(conversationParticipantsTable.userId, context.userId),
                isNull(conversationParticipantsTable.deletedAt)
            )
        );

    if (!participant) return false;

    return OrganizationService.hasActiveMembership(
        context.userId,
        context.organizationId
    );
};

const CONVERSATION_ACCESS_CHECKS: Record<
    ConversationType,
    (context: ConversationAccessContext) => Promise<boolean>
> = {
    [CONVERSATION_TYPES.SPACE]: canAccessSpaceConversation,
    [CONVERSATION_TYPES.DIRECT]: canAccessDirectConversation,
};

export const canAccessConversation = async (
    userId: string,
    conversationId: string
): Promise<boolean> => {
    const [conversation] = await db
        .select({
            type: conversationsTable.type,
            organizationId: conversationsTable.organizationId,
        })
        .from(conversationsTable)
        .where(
            and(
                eq(conversationsTable.id, conversationId),
                isNull(conversationsTable.deletedAt)
            )
        );

    if (!conversation) throw new ConversationNotFoundError();

    const checkAccess = CONVERSATION_ACCESS_CHECKS[conversation.type];
    if (!checkAccess) return false;

    return checkAccess({
        userId,
        conversationId,
        organizationId: conversation.organizationId,
    });
};
