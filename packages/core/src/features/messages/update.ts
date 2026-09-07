import { db, messagesTable, eq, and, isNull, sql } from "@standin/database";
import {
    MessageNotFoundError,
    MessageAccessDeniedError,
} from "@standin/contracts";
import type { Message, MessageUpdateSchemaType } from "@standin/contracts";
import { messageSelect } from "./consts";
import { buildMessage } from "./builders";

export const updateMessage = async (
    conversationId: string,
    messageId: string,
    senderId: string,
    { content }: MessageUpdateSchemaType
): Promise<Message> => {
    const editedAt = new Date();

    // Single UPDATE...RETURNING scoped to the sender, instead of a SELECT
    // to check ownership followed by a separate UPDATE: whether editedAt
    // actually bumps is decided in the same statement (only when the
    // content really changed), so there's no read-then-write gap either.
    const [message] = await db
        .update(messagesTable)
        .set({
            content,
            editedAt: sql`CASE WHEN ${messagesTable.content} = ${content} THEN ${messagesTable.editedAt} ELSE ${editedAt} END`,
        })
        .where(
            and(
                eq(messagesTable.id, messageId),
                eq(messagesTable.conversationId, conversationId),
                eq(messagesTable.senderId, senderId),
                isNull(messagesTable.deletedAt)
            )
        )
        .returning(messageSelect);

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
