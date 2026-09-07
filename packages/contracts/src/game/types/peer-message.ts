import type { MessageWithDetails } from "../../chat/types/message-with-details";
import { PEER_MESSAGE_TYPES } from "../enums/peer-message";
import type { PlayerPosition } from "./player";

// Read receipts are resolved server-side and only exposed via the REST
// message payload, never broadcast over the peer mesh, so this type omits
// seenBy rather than relying on call sites to strip it.
export type PeerMessagePayload = Omit<MessageWithDetails, "seenBy">;

export type PeerChatPayload = {
    conversationId: string;
    message: PeerMessagePayload;
    // The persisted message only carries senderId; the peer already knows
    // its own display name, so it's sent directly instead of requiring a
    // participants lookup on receipt.
    senderName: string;
};

export type PeerTypingPayload = {
    conversationId: string;
    userId: string;
    // conversation_participants is a point-in-time snapshot from space
    // creation, so it won't resolve users who joined later. The sender
    // includes its own name to avoid that gap.
    userName: string;
    isTyping: boolean;
};

export type PeerReactionPayload = {
    conversationId: string;
    messageId: string;
    emoji: string;
    userId: string;
    added: boolean;
};

export type PeerEditPayload = {
    conversationId: string;
    messageId: string;
    userId: string;
    content: string;
    editedAt: string;
};

export type PeerDeletePayload = {
    conversationId: string;
    messageId: string;
    userId: string;
};

// Sent once the API call behind broadcastChatMessage resolves, so peers can
// swap their temporary peer-*-id entry for the real persisted row. Without
// it, reacting to (or editing/deleting) a peer-delivered message fails,
// since its id was never a row the backend knows about.
export type PeerConfirmPayload = {
    conversationId: string;
    tempId: string;
    message: PeerMessagePayload;
};

export type PeerMessage =
    | { type: typeof PEER_MESSAGE_TYPES.POSITION; payload: PlayerPosition }
    | { type: typeof PEER_MESSAGE_TYPES.CHAT; payload: PeerChatPayload }
    | { type: typeof PEER_MESSAGE_TYPES.TYPING; payload: PeerTypingPayload }
    | {
          type: typeof PEER_MESSAGE_TYPES.REACTION;
          payload: PeerReactionPayload;
      }
    | { type: typeof PEER_MESSAGE_TYPES.EDIT; payload: PeerEditPayload }
    | { type: typeof PEER_MESSAGE_TYPES.DELETE; payload: PeerDeletePayload }
    | { type: typeof PEER_MESSAGE_TYPES.CONFIRM; payload: PeerConfirmPayload };
