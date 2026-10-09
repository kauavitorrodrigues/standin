import {
    MessageWithDetailsSchema,
    PEER_MESSAGE_TYPES,
    type PeerChatPayload,
    type PeerConfirmPayload,
    type PeerDeletePayload,
    type PeerEditPayload,
    type PeerMediaStatePayload,
    type PeerMessage,
    type PeerReactionPayload,
    type PeerTypingPayload,
} from "@standin/contracts";
import { isPlayerPosition } from "./isPlayerPosition";

// The nested `message` carries attachments/reactions arrays that a shallow
// typeof check can't see into; a malformed one reaches renderers like
// MessageAttachments/MessageReactionPills that assume those arrays exist.
// The real schema catches that instead of trusting the shape blindly.
const isPeerChatPayload = (data: unknown): data is PeerChatPayload => {
    if (typeof data !== "object" || data === null) return false;

    const candidate = data as Record<string, unknown>;
    return (
        typeof candidate.conversationId === "string" &&
        typeof candidate.senderName === "string" &&
        MessageWithDetailsSchema.safeParse(candidate.message).success
    );
};

const isPeerTypingPayload = (data: unknown): data is PeerTypingPayload => {
    if (typeof data !== "object" || data === null) return false;

    const candidate = data as Record<string, unknown>;
    return (
        typeof candidate.conversationId === "string" &&
        typeof candidate.userId === "string" &&
        typeof candidate.userName === "string" &&
        typeof candidate.isTyping === "boolean"
    );
};

const isPeerReactionPayload = (data: unknown): data is PeerReactionPayload => {
    if (typeof data !== "object" || data === null) return false;

    const candidate = data as Record<string, unknown>;
    return (
        typeof candidate.conversationId === "string" &&
        typeof candidate.messageId === "string" &&
        typeof candidate.emoji === "string" &&
        typeof candidate.userId === "string" &&
        typeof candidate.added === "boolean"
    );
};

const isPeerEditPayload = (data: unknown): data is PeerEditPayload => {
    if (typeof data !== "object" || data === null) return false;

    const candidate = data as Record<string, unknown>;
    return (
        typeof candidate.conversationId === "string" &&
        typeof candidate.messageId === "string" &&
        typeof candidate.userId === "string" &&
        typeof candidate.content === "string" &&
        typeof candidate.editedAt === "string"
    );
};

const isPeerDeletePayload = (data: unknown): data is PeerDeletePayload => {
    if (typeof data !== "object" || data === null) return false;

    const candidate = data as Record<string, unknown>;
    return (
        typeof candidate.conversationId === "string" &&
        typeof candidate.messageId === "string" &&
        typeof candidate.userId === "string"
    );
};

const isPeerConfirmPayload = (data: unknown): data is PeerConfirmPayload => {
    if (typeof data !== "object" || data === null) return false;

    const candidate = data as Record<string, unknown>;
    return (
        typeof candidate.conversationId === "string" &&
        typeof candidate.tempId === "string" &&
        MessageWithDetailsSchema.safeParse(candidate.message).success
    );
};

const isNullableString = (value: unknown): value is string | null =>
    value === null || typeof value === "string";

const isPeerMediaStatePayload = (
    data: unknown
): data is PeerMediaStatePayload => {
    if (typeof data !== "object" || data === null) return false;

    const candidate = data as Record<string, unknown>;
    return (
        typeof candidate.userId === "string" &&
        isNullableString(candidate.cameraStreamId) &&
        isNullableString(candidate.screenStreamId) &&
        typeof candidate.isMicMuted === "boolean"
    );
};

// Messages arrive over the raw WebRTC data channel, never validated
// server-side (the server never inspects peer traffic by design). A
// malicious or buggy peer can send anything, so guard the envelope and its
// payload before either reaches app state.
export const parsePeerMessage = (data: unknown): PeerMessage | null => {
    if (typeof data !== "object" || data === null) return null;

    const candidate = data as Record<string, unknown>;
    switch (candidate.type) {
    case PEER_MESSAGE_TYPES.POSITION:
        return isPlayerPosition(candidate.payload)
            ? { type: PEER_MESSAGE_TYPES.POSITION, payload: candidate.payload }
            : null;
    case PEER_MESSAGE_TYPES.CHAT:
        return isPeerChatPayload(candidate.payload)
            ? { type: PEER_MESSAGE_TYPES.CHAT, payload: candidate.payload }
            : null;
    case PEER_MESSAGE_TYPES.TYPING:
        return isPeerTypingPayload(candidate.payload)
            ? { type: PEER_MESSAGE_TYPES.TYPING, payload: candidate.payload }
            : null;
    case PEER_MESSAGE_TYPES.REACTION:
        return isPeerReactionPayload(candidate.payload)
            ? {
                type: PEER_MESSAGE_TYPES.REACTION,
                payload: candidate.payload,
            }
            : null;
    case PEER_MESSAGE_TYPES.EDIT:
        return isPeerEditPayload(candidate.payload)
            ? { type: PEER_MESSAGE_TYPES.EDIT, payload: candidate.payload }
            : null;
    case PEER_MESSAGE_TYPES.DELETE:
        return isPeerDeletePayload(candidate.payload)
            ? { type: PEER_MESSAGE_TYPES.DELETE, payload: candidate.payload }
            : null;
    case PEER_MESSAGE_TYPES.CONFIRM:
        return isPeerConfirmPayload(candidate.payload)
            ? { type: PEER_MESSAGE_TYPES.CONFIRM, payload: candidate.payload }
            : null;
    case PEER_MESSAGE_TYPES.MEDIA_STATE:
        return isPeerMediaStatePayload(candidate.payload)
            ? {
                type: PEER_MESSAGE_TYPES.MEDIA_STATE,
                payload: candidate.payload,
            }
            : null;
    default:
        return null;
    }
};

// The userId a peer message claims to speak for, so the caller can check
// it against the userId the server actually associates with that socket
// (see space:joined/space:peer-joined). POSITION carries no identity claim
// worth checking, so it's not part of PeerMessage's userId-bearing union
// here.
export const getClaimedUserId = (
    message: Exclude<PeerMessage, { type: typeof PEER_MESSAGE_TYPES.POSITION }>
): string => {
    switch (message.type) {
    case PEER_MESSAGE_TYPES.CHAT:
        return message.payload.message.senderId;
    case PEER_MESSAGE_TYPES.TYPING:
        return message.payload.userId;
    case PEER_MESSAGE_TYPES.REACTION:
        return message.payload.userId;
    case PEER_MESSAGE_TYPES.EDIT:
        return message.payload.userId;
    case PEER_MESSAGE_TYPES.DELETE:
        return message.payload.userId;
    case PEER_MESSAGE_TYPES.CONFIRM:
        return message.payload.message.senderId;
    case PEER_MESSAGE_TYPES.MEDIA_STATE:
        return message.payload.userId;
    }
};

// Whether a peer message may be believed, given the userId the server says
// owns the socket it came from. A peer can put anyone's id in a payload, so
// anything that speaks for a user must match the server's record. An unknown
// socket (knownUserId undefined) never matches, so nothing from a peer the
// server has not announced gets through. POSITION carries no identity claim.
export const isMessageFromKnownSender = (
    message: PeerMessage,
    knownUserId: string | undefined
): boolean => {
    if (message.type === PEER_MESSAGE_TYPES.POSITION) return true;

    return getClaimedUserId(message) === knownUserId;
};

export const addPeerId = (peerIds: string[], socketId: string): string[] =>
    peerIds.includes(socketId) ? peerIds : [...peerIds, socketId];

export const removePeerId = (peerIds: string[], socketId: string): string[] =>
    peerIds.filter((id) => id !== socketId);