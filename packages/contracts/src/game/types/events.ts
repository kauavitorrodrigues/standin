import type { RemotePlayer } from "./player";
import type { SpaceJoinSchema, WebrtcSignalSchema } from "../schemas/space";
import type { z } from "zod/v4";

export const SpaceEvents = {
    SPACE_JOIN: "space:join",
    SPACE_JOINED: "space:joined",
    SPACE_PEER_JOINED: "space:peer-joined",
    SPACE_PEER_LEFT: "space:peer-left",
    SPACE_DUPLICATE_SESSION: "space:duplicate-session",
    WEBRTC_SIGNAL: "webrtc:signal",
} as const;

export type SpaceEvent = (typeof SpaceEvents)[keyof typeof SpaceEvents];

export type SpaceJoinPayload = z.infer<typeof SpaceJoinSchema>;
export type WebrtcSignalInput = z.infer<typeof WebrtcSignalSchema>;

export type SpaceJoinedPayload = {
    peers: RemotePlayer[];
};

export type PeerJoinedPayload = RemotePlayer;

export type PeerLeftPayload = {
    socketId: string;
    userId: string;
};

export type WebrtcSignalOutput = {
    fromSocketId: string;
    signal: unknown;
};

export type ClientToServerEvents = {
    "space:join": (payload: SpaceJoinPayload) => void;
    "webrtc:signal": (payload: WebrtcSignalInput) => void;
};

export type ServerToClientEvents = {
    "space:joined": (payload: SpaceJoinedPayload) => void;
    "space:peer-joined": (payload: PeerJoinedPayload) => void;
    "space:peer-left": (payload: PeerLeftPayload) => void;
    // Sent right before the server force-disconnects this socket because
    // the same userId just joined this space from another connection (e.g.
    // a second tab). socket.io-client doesn't auto-reconnect after a
    // server-initiated disconnect, so no rejoin loop follows.
    "space:duplicate-session": () => void;
    "webrtc:signal": (payload: WebrtcSignalOutput) => void;
};
