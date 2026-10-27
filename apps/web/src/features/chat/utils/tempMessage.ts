import type { MessageWithDetails } from "@standin/contracts";
import { OPTIMISTIC_MESSAGE_ID_PREFIX } from "@/features/chat/consts/messages";

// The id of the sender's own optimistic row, reconciled by the send mutation
// once the API responds.
export const createOptimisticMessageId = (): string =>
    `${OPTIMISTIC_MESSAGE_ID_PREFIX}${crypto.randomUUID()}`;

type BuildTempMessageParams = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string | null;
    threadParentId?: string;
    showThreadReplyInChannel?: boolean;
};

export const buildTempMessage = ({
    id,
    conversationId,
    senderId,
    content,
    threadParentId,
    showThreadReplyInChannel = false,
}: BuildTempMessageParams): MessageWithDetails => ({
    id,
    conversationId,
    senderId,
    content,
    threadParentId: threadParentId ?? null,
    showThreadReplyInChannel,
    createdAt: new Date().toISOString(),
    editedAt: null,
    attachments: [],
    reactions: [],
    seenBy: [],
    replyCount: 0,
    lastReplyAt: null,
    lastReplyPreview: null,
});
