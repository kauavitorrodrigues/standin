import {
    db,
    messageAttachmentsTable,
    messagesTable,
    filesTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import { AttachmentNotFoundError } from "@standin/contracts";

export type AccessibleAttachment = {
    id: string;
    fileName: string;
    originalName: string;
    mimeType: string;
};

// Scoped to conversationId + messageId (not just the attachment id) so a
// member of one conversation can't read another conversation's attachment
// by guessing/enumerating its id.
export const findAccessibleAttachment = async (
    attachmentId: string,
    messageId: string,
    conversationId: string
): Promise<AccessibleAttachment> => {
    const [attachment] = await db
        .select({
            id: messageAttachmentsTable.id,
            fileName: filesTable.fileName,
            originalName: filesTable.originalName,
            mimeType: filesTable.mimeType,
        })
        .from(messageAttachmentsTable)
        .innerJoin(
            messagesTable,
            eq(messageAttachmentsTable.messageId, messagesTable.id)
        )
        .innerJoin(filesTable, eq(messageAttachmentsTable.fileId, filesTable.id))
        .where(
            and(
                eq(messageAttachmentsTable.id, attachmentId),
                eq(messageAttachmentsTable.messageId, messageId),
                eq(messagesTable.conversationId, conversationId),
                isNull(messagesTable.deletedAt),
                isNull(filesTable.deletedAt)
            )
        );

    if (!attachment) throw new AttachmentNotFoundError();

    return attachment;
};
