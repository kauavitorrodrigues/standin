import { messageAttachmentSelect } from "../consts";
import { messageAttachmentsTable } from "@standin/database";
import type { Transaction } from "@standin/database";
import type { AttachmentRow } from "./builders";

export const createManyAttachments = async (
    messageId: string,
    fileIds: string[],
    tx: Transaction
): Promise<AttachmentRow[]> => {
    if (fileIds.length === 0) return [];
    return tx
        .insert(messageAttachmentsTable)
        .values(fileIds.map((fileId) => ({ messageId, fileId })))
        .returning(messageAttachmentSelect);
};
