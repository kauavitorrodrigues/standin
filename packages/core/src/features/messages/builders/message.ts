import type {
    MessageAttachment,
    MessageReactionSummary,
    SeenByEntry,
    MessageWithDetails,
    Message,
} from "@standin/contracts";
import { toISOStringOrNull } from "../utils";
import { EMPTY_THREAD_SUMMARY, type ThreadSummary } from "../threads";

export const buildMessageWithDetails = (
    row: MessageRow,
    attachments: MessageAttachment[],
    reactions: MessageReactionSummary[],
    seenBy: SeenByEntry[],
    thread: ThreadSummary = EMPTY_THREAD_SUMMARY
): MessageWithDetails => ({
    ...buildMessage(row),
    attachments,
    reactions,
    seenBy,
    ...thread,
});

export type MessageRow = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string | null;
    threadParentId: string | null;
    showThreadReplyInChannel: boolean;
    createdAt: Date;
    editedAt: Date | null;
};

export const buildMessage = (row: MessageRow): Message => ({
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    content: row.content,
    threadParentId: row.threadParentId,
    showThreadReplyInChannel: row.showThreadReplyInChannel,
    createdAt: row.createdAt.toISOString(),
    editedAt: toISOStringOrNull(row.editedAt),
});
