import { conversationsTable, and, inArray, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";

export const deleteConversationsBySpaceIds = async (
    spaceIds: string[],
    tx: Transaction
): Promise<void> => {
    if (spaceIds.length === 0) return;

    await tx
        .update(conversationsTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                inArray(conversationsTable.spaceId, spaceIds),
                isNull(conversationsTable.deletedAt)
            )
        );
};
