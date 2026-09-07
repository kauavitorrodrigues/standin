import { File, MessageAttachment } from "@standin/contracts";

export type AttachmentRow = {
    id: string;
    messageId: string;
    fileId: string;
};

export const buildMessageAttachments = (
    attachmentRows: AttachmentRow[],
    files: File[]
): MessageAttachment[] => {
    const filesById = new Map(files.map((file) => [file.id, file]));
    return attachmentRows.reduce<MessageAttachment[]>((attachments, row) => {
        const file = filesById.get(row.fileId);
        if (file) attachments.push({ id: row.id, file });
        return attachments;
    }, []);
};
