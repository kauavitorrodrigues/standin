import {
    db,
    messagesTable,
    messageAttachmentsTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import {
    MessageNotFoundError,
    MessageAccessDeniedError,
} from "@standin/contracts";
import type { Message } from "@standin/contracts";
import { messageSelect } from "./consts";
import { buildMessage } from "./builders";
import { FileService } from "../files";

export const deleteMessage = async (
    conversationId: string,
    messageId: string,
    senderId: string
): Promise<Message> => {
    const message = await db.transaction(async (tx) => {
        // Single UPDATE...RETURNING scoped to the sender, instead of a SELECT
        // to check ownership followed by a separate UPDATE.
        const [message] = await tx
            .update(messagesTable)
            .set({ deletedAt: new Date() })
            .where(
                and(
                    eq(messagesTable.id, messageId),
                    eq(messagesTable.conversationId, conversationId),
                    eq(messagesTable.senderId, senderId),
                    isNull(messagesTable.deletedAt)
                )
            )
            .returning(messageSelect);

        if (!message) return undefined;

        const attachments = await tx
            .select({ fileId: messageAttachmentsTable.fileId })
            .from(messageAttachmentsTable)
            .where(eq(messageAttachmentsTable.messageId, messageId));

        await FileService.deleteManyByIds(
            attachments.map(({ fileId }) => fileId),
            tx
        );

        return message;
    });

    if (message) return buildMessage(message);

    // Distinguish not-found from access-denied for the right error.
    const [existing] = await db
        .select({ id: messagesTable.id })
        .from(messagesTable)
        .where(
            and(
                eq(messagesTable.id, messageId),
                eq(messagesTable.conversationId, conversationId),
                isNull(messagesTable.deletedAt)
            )
        );

    throw existing ? new MessageAccessDeniedError() : new MessageNotFoundError();
};
