// Discriminator for messages exchanged over the P2P (WebRTC data channel)
// mesh. Mirrors SpaceEvents' role for socket.io events, but for the
// unmediated peer-to-peer channel the server never inspects.
export const PEER_MESSAGE_TYPES = {
    POSITION: "POSITION",
    CHAT: "CHAT",
    TYPING: "TYPING",
    REACTION: "REACTION",
    EDIT: "EDIT",
    DELETE: "DELETE",
    CONFIRM: "CONFIRM",
} as const;

export type PeerMessageType =
    (typeof PEER_MESSAGE_TYPES)[keyof typeof PEER_MESSAGE_TYPES];
