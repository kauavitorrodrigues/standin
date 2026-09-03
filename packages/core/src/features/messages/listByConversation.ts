import {
    db,
    messagesTable,
    and,
    eq,
    lt,
    isNull,
    desc,
} from "@standin/database";
import { DEFAULT_MESSAGE_LIST_LIMIT } from "@standin/contracts";
import type {
    ConversationMessagesListResponse,
    MessageListQuerySchemaType,
} from "@standin/contracts";
import { messageSelect } from "./consts";
import { UserService } from "../users";
import { FileService } from "../files";
import { MessageAttachmentService } from "./attachments";
import { MessageReactionService } from "./reactions";
import { buildConversationMessagesListResponse } from "./builders";

export const listMessagesByConversation = async (
    conversationId: string,
    currentUserId: string,
    { cursor, limit = DEFAULT_MESSAGE_LIST_LIMIT }: MessageListQuerySchemaType
): Promise<ConversationMessagesListResponse> => {
    // Conversation existence + org scoping is enforced upstream by the
    // RequiresConversationAccess middleware, so it isn't re-checked here.

    // Keyset on `id` alone: ids are uuidv7 (time-ordered), so this is exact and
    // tie-free, avoiding the millisecond-precision mismatch a `createdAt` cursor
    // would have against the database's microsecond timestamp column.
    const rows = await db
        .select(messageSelect)
        .from(messagesTable)
        .where(
            and(
                eq(messagesTable.conversationId, conversationId),
                isNull(messagesTable.deletedAt),
                cursor ? lt(messagesTable.id, cursor) : undefined
            )
        )
        // Newest first, so the client walks backwards in time (infinite scroll upward).
        .orderBy(desc(messagesTable.id))
        .limit(limit + 1);

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? page[page.length - 1].id : null;
    const messageIds = page.map((message) => message.id);
    const senderIds = [...new Set(page.map((message) => message.senderId))];

    const [senders, attachmentRows, reactionRows] = await Promise.all([
        UserService.findManyByIds(senderIds),
        MessageAttachmentService.listByMessageIds(messageIds),
        MessageReactionService.listByMessageIds(messageIds),
    ]);

    const files = await FileService.findManyByIds(
        attachmentRows.map((attachment) => attachment.fileId)
    );

    return buildConversationMessagesListResponse({
        page,
        senders,
        attachmentRows,
        files,
        reactionRows,
        currentUserId,
        nextCursor,
    });
};
