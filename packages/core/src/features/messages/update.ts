import { db, messagesTable, eq, and, isNull, sql } from "@standin/database";
import {
    MessageNotFoundError,
    MessageAccessDeniedError,
    parseMentionUserIds,
} from "@standin/contracts";
import type { Message, MessageUpdateSchemaType } from "@standin/contracts";
import { findConversationById } from "../conversations/findById";
import { messageSelect } from "./consts";
import { buildMessage } from "./builders";
import {
    assertCanMention,
    assertMentionLimit,
    assertNotSelfMention,
    deleteMentions,
    diffMentions,
    groupMentionsByMessage,
    insertMentions,
    listMentionedUserIds,
    listMentionsByMessageIds,
} from "./mentions";

export type UpdatedMessage = {
    message: Message;
    // The people this edit mentions for the first time, the only ones to
    // notify. A mention that was already there is kept and stays quiet.
    addedUserIds: string[];
};

export const updateMessage = async (
    conversationId: string,
    organizationId: string,
    messageId: string,
    senderId: string,
    { content }: MessageUpdateSchemaType
): Promise<UpdatedMessage> => {
    const editedAt = new Date();
    const conversation = await findConversationById(
        conversationId,
        organizationId
    );
    const mentionedUserIds = parseMentionUserIds(content);
    assertMentionLimit(mentionedUserIds);

    const updated = await db.transaction(async (tx) => {
        const diff = diffMentions(
            await listMentionedUserIds(messageId, tx),
            mentionedUserIds
        );
        // Only who is added is checked: a person who has since left the
        // organization stays mentioned in a message that keeps the mention.
        assertNotSelfMention(senderId, diff.added);
        await assertCanMention(conversation, diff.added);

        // Single UPDATE...RETURNING scoped to the sender, instead of a SELECT
        // to check ownership followed by a separate UPDATE: whether editedAt
        // actually bumps is decided in the same statement (only when the
        // content really changed), so there's no read-then-write gap either.
        const [message] = await tx
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

        if (!message) return null;

        await deleteMentions(messageId, diff.removed, tx);
        await insertMentions(messageId, diff.added, tx);

        return { message, addedUserIds: diff.added };
    });

    if (updated) {
        const mentions = groupMentionsByMessage(
            await listMentionsByMessageIds([messageId])
        );
        return {
            message: buildMessage(
                updated.message,
                mentions.get(messageId) ?? []
            ),
            addedUserIds: updated.addedUserIds,
        };
    }

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

    if (existing) throw new MessageAccessDeniedError();
    throw new MessageNotFoundError();
};
