import { db, messagesTable, eq, and, isNull } from "@standin/database";
import { MessageNotFoundError } from "@standin/contracts";

export const assertMessageInConversation = async (
    messageId: string,
    conversationId: string
): Promise<void> => {
    const [message] = await db
        .select({ id: messagesTable.id })
        .from(messagesTable)
        .where(
            and(
                eq(messagesTable.id, messageId),
                eq(messagesTable.conversationId, conversationId),
                isNull(messagesTable.deletedAt)
            )
        );

    if (!message) throw new MessageNotFoundError();
};
