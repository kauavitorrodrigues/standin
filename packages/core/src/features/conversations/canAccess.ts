import {
    db,
    conversationParticipantsTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import { CONVERSATION_TYPES, type ConversationType } from "@standin/contracts";
import { OrganizationService } from "../organizations";
import type { ConversationRow } from "./utils/assertAccessible";

type ConversationAccessContext = {
    userId: string;
    conversationId: string;
    organizationId: string;
};

// A space's conversation is scoped to the whole organization, not to the
// conversation_participants snapshot taken when the space was created:
// any active org member can read/post here, even one who joined after the
// space existed. conversation_participants is only used to list who was
// around at creation time, not to gate access.
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
    conversation: ConversationRow
): Promise<boolean> => {
    const checkAccess = CONVERSATION_ACCESS_CHECKS[conversation.type];
    if (!checkAccess) return false;

    return checkAccess({
        userId,
        conversationId: conversation.id,
        organizationId: conversation.organizationId,
    });
};
