import { db, messagesTable } from "@standin/database";
import type {
    CreateMessageInput,
    MessageWithDetails,
} from "@standin/contracts";
import { FileService } from "../files";
import { messageSelect } from "./consts";
import { MessageAttachmentService } from "./attachments";
import { buildMessageWithDetails } from "./builders";
import { buildMessageAttachments } from "./attachments/builders";

export const createMessage = async (
    conversationId: string,
    senderId: string,
    { content, attachmentFiles }: CreateMessageInput
): Promise<MessageWithDetails> => {
    // Uploaded outside the transaction on purpose (external storage I/O
    // shouldn't hold a DB transaction open); the message + attachment rows
    // are then inserted together so a mid-loop failure can't leave a
    // partially-attached message visible to other participants.
    const uploadedFiles = await Promise.all(
        attachmentFiles.map((file) => FileService.upload(file))
    );

    const { message, attachmentRows } = await db
        .transaction(async (tx) => {
            const [message] = await tx
                .insert(messagesTable)
                .values({ conversationId, senderId, content })
                .returning(messageSelect);

            const attachmentRows = await MessageAttachmentService.createMany(
                message.id,
                uploadedFiles.map((file) => file.id),
                tx
            );

            return { message, attachmentRows };
        })
        .catch(async (error) => {
            // Best-effort: the transaction rolled back, so these uploads are
            // now orphaned in storage. Failing to clean one up shouldn't
            // hide the original error from the caller.
            await Promise.allSettled(
                uploadedFiles.map((file) => FileService.delete(file.id))
            );
            throw error;
        });

    return buildMessageWithDetails(
        message,
        buildMessageAttachments(attachmentRows, uploadedFiles),
        []
    );
};
