import type { MessageWithDetails } from "@standin/contracts";
import {
    OPTIMISTIC_MESSAGE_ID_PREFIX,
    PEER_MESSAGE_ID_PREFIX,
} from "@/features/chat/consts/messages";

// Ids for a message that doesn't exist server-side yet: one flavor for the
// sender's own optimistic row (reconciled by the send mutation once the API
// responds), another for the copy broadcast to peers over the P2P mesh
// (reconciled by a CONFIRM broadcast once that same response comes back).
export const createOptimisticMessageId = (): string =>
    `${OPTIMISTIC_MESSAGE_ID_PREFIX}${crypto.randomUUID()}`;

export const createPeerMessageId = (): string =>
    `${PEER_MESSAGE_ID_PREFIX}${crypto.randomUUID()}`;

type BuildTempMessageParams = {
    id: string;
    conversationId: string;
    senderId: string;
    content: string | null;
};

export const buildTempMessage = ({
    id,
    conversationId,
    senderId,
    content,
}: BuildTempMessageParams): MessageWithDetails => ({
    id,
    conversationId,
    senderId,
    content,
    createdAt: new Date().toISOString(),
    editedAt: null,
    attachments: [],
    reactions: [],
    seenBy: [],
});
