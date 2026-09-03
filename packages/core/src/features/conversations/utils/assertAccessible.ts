import { ConversationNotFoundError } from "@standin/contracts";

export type ConversationRow = { id: string; organizationId: string };

// Central place for the "is this conversation reachable in this context"
// checks, so a new constraint (e.g. deletedAt, spaceId scoping) is added
// once here instead of at every call site that loads a conversation.
export const assertConversationAccessible = (
    conversation: ConversationRow | undefined,
    organizationId: string
): ConversationRow => {
    if (!conversation || conversation.organizationId !== organizationId) {
        throw new ConversationNotFoundError();
    }

    return conversation;
};
