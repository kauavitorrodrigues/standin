import { messageAttachmentSelect } from "../consts";
import { db, messageAttachmentsTable, inArray } from "@standin/database";
import type { AttachmentRow } from "./builders";

export const listAttachmentsByMessageIds = async (
    messageIds: string[]
): Promise<AttachmentRow[]> => {
    if (messageIds.length === 0) return [];

    return db
        .select(messageAttachmentSelect)
        .from(messageAttachmentsTable)
        .where(inArray(messageAttachmentsTable.messageId, messageIds))
        .orderBy(messageAttachmentsTable.createdAt);
};
