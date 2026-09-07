import { db, conversationReadsTable, type Transaction } from "@standin/database";
import { MessageReadService } from "../../messages";

// Always "now", never a readAt coming from the client. A caller can't force
// an arbitrary or backdated read state.
//
// Both writes (the conversation cursor and the per-message seen-by rows)
// happen in the same transaction so they can never drift apart. A failure
// partway through never leaves the cursor advanced without the matching
// message_reads rows, or vice versa.
export const markConversationAsRead = async (
    conversationId: string,
    userId: string,
    outerTx?: Transaction
): Promise<void> => {
    const run = async (tx: Transaction | typeof db) => {
        const lastReadAt = new Date();

        await tx
            .insert(conversationReadsTable)
            .values({ conversationId, userId, lastReadAt })
            .onConflictDoUpdate({
                target: [
                    conversationReadsTable.conversationId,
                    conversationReadsTable.userId,
                ],
                set: { lastReadAt },
            });

        await MessageReadService.recordSeenBy(conversationId, userId, tx);
    };

    if (outerTx) return run(outerTx);
    return db.transaction(run);
};
