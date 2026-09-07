import { db, messageReadsTable, inArray, asc } from "@standin/database";
import type { SeenByEntry } from "@standin/contracts";
import { UserService } from "../../users";

// Grouped by message, same shape senders/reactions already use downstream
// (see buildConversationMessagesListResponse). One lookup per page, never
// one query per message.
//
// Ordered by readAt ascending, so each message's list is in the order
// people actually saw it. The UI only ever shows the last entry in this
// list (whoever saw it most recently, with their readAt), never the whole list.
export const listSeenBy = async (
    messageIds: string[]
): Promise<Map<string, SeenByEntry[]>> => {
    if (messageIds.length === 0) return new Map();

    const rows = await db
        .select({
            messageId: messageReadsTable.messageId,
            userId: messageReadsTable.userId,
            readAt: messageReadsTable.createdAt,
        })
        .from(messageReadsTable)
        .where(inArray(messageReadsTable.messageId, messageIds))
        .orderBy(asc(messageReadsTable.createdAt));

    const viewers = await UserService.findManyByIds([
        ...new Set(rows.map((row) => row.userId)),
    ]);
    const viewersById = new Map(viewers.map((viewer) => [viewer.id, viewer]));

    const seenByMessage = new Map<string, SeenByEntry[]>();
    for (const row of rows) {
        const viewer = viewersById.get(row.userId);
        if (!viewer) continue;

        const list = seenByMessage.get(row.messageId) ?? [];
        list.push({ ...viewer, readAt: row.readAt.toISOString() });
        seenByMessage.set(row.messageId, list);
    }

    return seenByMessage;
};
