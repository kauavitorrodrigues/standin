import { CONVERSATION_TYPES } from "@standin/contracts";
import type { ConversationRow } from "./utils/assertAccessible";
import { OrganizationMemberService } from "../organizations";
import { listConversationParticipants } from "./participants/listByConversation";

// Who should hear about new activity in this conversation, other than the
// actor. Mirrors the same SPACE vs DIRECT split as canAccessConversation:
// SPACE reaches every active org member (conversation_participants is only
// a creation-time snapshot, not the access boundary), DIRECT only its
// active participants.
export const getConversationRecipientUserIds = async (
    conversation: ConversationRow,
    excludeUserId: string
): Promise<string[]> => {
    if (conversation.type === CONVERSATION_TYPES.SPACE) {
        // One select, so it needs no transaction around it.
        const members = await OrganizationMemberService.findActive(
            conversation.organizationId
        );

        return members
            .map((member) => member.userId)
            .filter((userId) => userId !== excludeUserId);
    }

    const participants = await listConversationParticipants(conversation.id);

    return participants
        .map((participant) => participant.id)
        .filter((userId) => userId !== excludeUserId);
};
