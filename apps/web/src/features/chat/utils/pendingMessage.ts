import { OPTIMISTIC_MESSAGE_ID_PREFIX } from "@/features/chat/consts/messages";

// True for a message that only exists locally so far (sent by this client and
// awaiting its API response). Reacting, editing or deleting it would send a
// server-unknown id and fail with a 404, so callers should disable those
// actions until the id resolves.
export const isPendingMessageId = (messageId: string): boolean =>
    messageId.startsWith(OPTIMISTIC_MESSAGE_ID_PREFIX);
