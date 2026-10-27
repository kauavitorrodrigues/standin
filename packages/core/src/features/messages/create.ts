import { db, messagesTable } from "@standin/database";
import type {
    CreateMessageInput,
    MessageWithDetails,
} from "@standin/contracts";
import { FileService } from "../files";
import { messageSelect, MESSAGE_ATTACHMENTS_STORAGE_FOLDER } from "./consts";
import { MessageAttachmentService } from "./attachments";
import { buildMessageWithDetails } from "./builders";
import { assertThreadParent } from "./threads";
import { buildMessageAttachments } from "./attachments/builders";

export const createMessage = async (
    conversationId: string,
    senderId: string,
    {
        content,
        attachmentFiles,
        threadParentId,
        showThreadReplyInChannel,
    }: CreateMessageInput
): Promise<MessageWithDetails> => {
    // Checked before any upload so a rejected reply leaves nothing in storage.
    if (threadParentId) {
        await assertThreadParent(threadParentId, conversationId);
    }

    // Uploaded outside the transaction on purpose (external storage I/O
    // shouldn't hold a DB transaction open); the message + attachment rows
    // are then inserted together so a mid-loop failure can't leave a
    // partially-attached message visible to other participants.
    const uploadedFiles = await Promise.all(
        attachmentFiles.map((file) =>
            FileService.upload(file, {
                folder: MESSAGE_ATTACHMENTS_STORAGE_FOLDER,
            })
        )
    );

    const { message, attachmentRows } = await db
        .transaction(async (tx) => {
            const [message] = await tx
                .insert(messagesTable)
                .values({
                    conversationId,
                    senderId,
                    content,
                    threadParentId: threadParentId ?? null,
                    // Only a reply can show in the channel.
                    showThreadReplyInChannel:
                        threadParentId !== undefined &&
                        showThreadReplyInChannel === true,
                })
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
        [],
        []
    );
};
