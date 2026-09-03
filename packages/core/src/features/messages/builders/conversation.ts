import type {
    ConversationMessagesListResponse,
    File,
    UserSummary,
} from "@standin/contracts";
import { groupReactionsByMessage } from "../utils";
import { buildMessageWithDetails, MessageRow } from "./message";
import {
    AttachmentRow,
    buildMessageAttachments,
} from "../attachments/builders";
import type { ReactionRow } from "../reactions/types";

type BuildConversationMessagesListResponseInput = {
    page: MessageRow[];
    senders: UserSummary[];
    attachmentRows: AttachmentRow[];
    files: File[];
    reactionRows: ReactionRow[];
    currentUserId: string;
    nextCursor: string | null;
};

const groupAttachmentRowsByMessage = (
    attachmentRows: AttachmentRow[]
): Map<string, AttachmentRow[]> => {
    const rowsByMessage = new Map<string, AttachmentRow[]>();

    for (const row of attachmentRows) {
        const list = rowsByMessage.get(row.messageId) ?? [];
        list.push(row);
        rowsByMessage.set(row.messageId, list);
    }

    return rowsByMessage;
};

export const buildConversationMessagesListResponse = ({
    page,
    senders,
    attachmentRows,
    files,
    reactionRows,
    currentUserId,
    nextCursor,
}: BuildConversationMessagesListResponseInput): ConversationMessagesListResponse => {
    const users = Object.fromEntries(senders.map((s) => [s.id, s]));

    const attachmentRowsByMessage =
        groupAttachmentRowsByMessage(attachmentRows);

    const reactionsByMessage = groupReactionsByMessage(
        reactionRows,
        currentUserId
    );

    const messages = page.map((row) =>
        buildMessageWithDetails(
            row,
            buildMessageAttachments(
                attachmentRowsByMessage.get(row.id) ?? [],
                files
            ),
            reactionsByMessage.get(row.id) ?? []
        )
    );

    return { messages, users, nextCursor };
};
