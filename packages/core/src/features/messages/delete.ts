import { db, messagesTable, eq, and, isNull } from "@standin/database";
import {
    MessageNotFoundError,
    MessageAccessDeniedError,
} from "@standin/contracts";
import type { Message } from "@standin/contracts";
import { messageSelect } from "./consts";
import { buildMessage } from "./builders";

export const deleteMessage = async (
    conversationId: string,
    messageId: string,
    senderId: string
): Promise<Message> => {
    const [existing] = await db
        .select({ senderId: messagesTable.senderId })
        .from(messagesTable)
        .where(
            and(
                eq(messagesTable.id, messageId),
                eq(messagesTable.conversationId, conversationId),
                isNull(messagesTable.deletedAt)
            )
        );

    if (!existing) throw new MessageNotFoundError();
    if (existing.senderId !== senderId) throw new MessageAccessDeniedError();

    const [message] = await db
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

    if (!message) throw new MessageNotFoundError();

    return buildMessage(message);
};
