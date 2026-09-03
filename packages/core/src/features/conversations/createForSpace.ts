import {
    conversationParticipantsTable,
    conversationsTable,
} from "@standin/database";
import { CONVERSATION_TYPES } from "@standin/contracts";
import type { Transaction } from "@standin/database";

export const createConversationForSpace = async (
    organizationId: string,
    spaceId: string,
    memberIds: string[],
    tx: Transaction
): Promise<void> => {
    const [conversation] = await tx
        .insert(conversationsTable)
        .values({ type: CONVERSATION_TYPES.SPACE, organizationId, spaceId })
        .returning({ id: conversationsTable.id });

    if (memberIds.length > 0) {
        await tx.insert(conversationParticipantsTable).values(
            memberIds.map((userId) => ({
                conversationId: conversation.id,
                userId,
            }))
        );
    }
};
