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
import { OrganizationService } from "../../../organizations/services";

type ConversationAccessContext = {
    userId: string;
    conversationId: string;
    organizationId: string;
};

const hasActiveOrgMembership = async ({
    userId,
    organizationId,
}: ConversationAccessContext): Promise<boolean> => {
    const membership = await OrganizationService.findMembership(
        userId,
        organizationId
    );
    return membership !== null;
};

const canAccessSpaceConversation = (
    context: ConversationAccessContext
): Promise<boolean> => hasActiveOrgMembership(context);

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

    return hasActiveOrgMembership(context);
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
