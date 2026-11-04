import {
    db,
    organizationMembersTable,
    and,
    eq,
    inArray,
    isNull,
} from "@standin/database";
import {
    CONVERSATION_TYPES,
    MAX_MESSAGE_MENTIONS,
    MentionLimitExceededError,
    MentionInDirectConversationError,
    MentionInvalidUserError,
} from "@standin/contracts";
import type { ConversationRow } from "../../conversations/utils/assertAccessible";

// Only a space conversation takes mentions, and only of people who can read
// it: any active member of the organization. One query for the whole list.
// Checked on every mention of the message, kept ones included, so an edit
// cannot grow past the cap either.
export const assertMentionLimit = (userIds: string[]): void => {
    if (userIds.length > MAX_MESSAGE_MENTIONS) {
        throw new MentionLimitExceededError();
    }
};

export const assertCanMention = async (
    conversation: ConversationRow,
    userIds: string[]
): Promise<void> => {
    if (userIds.length === 0) return;

    if (conversation.type !== CONVERSATION_TYPES.SPACE) {
        throw new MentionInDirectConversationError();
    }

    const members = await db
        .select({ userId: organizationMembersTable.userId })
        .from(organizationMembersTable)
        .where(
            and(
                eq(
                    organizationMembersTable.organizationId,
                    conversation.organizationId
                ),
                inArray(organizationMembersTable.userId, userIds),
                isNull(organizationMembersTable.deletedAt)
            )
        );

    if (members.length !== userIds.length) throw new MentionInvalidUserError();
};
