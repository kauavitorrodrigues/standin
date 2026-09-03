import type {
    MessageAttachment,
    MessageReactionSummary,
    MessageWithDetails,
    Message,
} from "@standin/contracts";
import { toISOStringOrNull } from "../utils";

export const buildMessageWithDetails = (
    row: MessageRow,
    attachments: MessageAttachment[],
    reactions: MessageReactionSummary[]
): MessageWithDetails => ({
    ...buildMessage(row),
    attachments,
    reactions,
});

export type MessageRow = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
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
