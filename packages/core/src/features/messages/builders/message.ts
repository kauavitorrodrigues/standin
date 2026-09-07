import type {
    MessageAttachment,
    MessageReactionSummary,
    SeenByEntry,
    MessageWithDetails,
    Message,
} from "@standin/contracts";
import { toISOStringOrNull } from "../utils";

export const buildMessageWithDetails = (
    row: MessageRow,
    attachments: MessageAttachment[],
    reactions: MessageReactionSummary[],
    seenBy: SeenByEntry[]
): MessageWithDetails => ({
    ...buildMessage(row),
    attachments,
    reactions,
    seenBy,
});

export type MessageRow = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string | null;
    createdAt: Date;
    editedAt: Date | null;
};

export const buildMessage = (row: MessageRow): Message => ({
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    editedAt: toISOStringOrNull(row.editedAt),
});
