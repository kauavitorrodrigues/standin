import type { RemotePlayer } from "./player";
import type {
    RoomEntitlementsPayload,
    RoomJoinAnswerPayload,
    RoomJoinCancelledPayload,
    RoomJoinDecisionPayload,
    RoomJoinRequestPayload,
    RoomJoinRequestedPayload,
    RoomCrossedPayload,
    RoomLockPayload,
    RoomOpenPayload,
    RoomPresentPayload,
    RoomStatePayload,
    RoomStatesPayload,
    RoomUnlockPayload,
} from "./room";
import type { MapServerEvents } from "../../maps/types/events";
import type {
    MapJoinSchema,
    SpaceJoinSchema,
    WebrtcSignalSchema,
} from "../schemas/space";
import type {
    EditorAcquireAck,
    EditorAck,
    EditorLockLostPayload,
    EditorLockPayload,
} from "../../maps/editor/types";
import type { z } from "zod/v4";
import type {
    SpaceGuestRemovedPayload,
    SpaceGuestRequestedPayload,
    SpaceGuestStatusPayload,
    SpaceGuestUpdatedPayload,
} from "../../spaces/guests/types";
import type {
    ChatMessageSeenPayload,
    ChatUnreadChangedPayload,
} from "../../chat/types/events";

export const SpaceEvents = {
    SPACE_JOIN: "space:join",
    SPACE_JOINED: "space:joined",
    SPACE_PEER_JOINED: "space:peer-joined",
    SPACE_PEER_LEFT: "space:peer-left",
    SPACE_DUPLICATE_SESSION: "space:duplicate-session",
    SPACE_AVATAR_CHANGED: "space:avatar-changed",
    SPACE_NAME_CHANGED: "space:name-changed",
    SPACE_GUEST_REQUESTED: "space:guest-requested",
    SPACE_GUEST_STATUS: "space:guest-status",
    SPACE_GUEST_REMOVED: "space:guest-removed",
    SPACE_GUEST_UPDATED: "space:guest-updated",
    SPACE_PROFILE_PICTURE_CHANGED: "space:profile-picture-changed",
    WEBRTC_SIGNAL: "webrtc:signal",
} as const;

export const EditorEvents = {
    EDITOR_ACQUIRE: "editor:acquire",
    EDITOR_HEARTBEAT: "editor:heartbeat",
    EDITOR_RELEASE: "editor:release",
    EDITOR_LOCK_LOST: "editor:lock_lost",
} as const;

export type EditorEvent = (typeof EditorEvents)[keyof typeof EditorEvents];

export type SpaceEvent = (typeof SpaceEvents)[keyof typeof SpaceEvents];

export type SpaceJoinPayload = z.infer<typeof SpaceJoinSchema>;
export type MapJoinPayload = z.infer<typeof MapJoinSchema>;
export type WebrtcSignalInput = z.infer<typeof WebrtcSignalSchema>;

export type SpaceJoinedPayload = {
    peers: RemotePlayer[];
};

export type PeerJoinedPayload = RemotePlayer;

export type AvatarChangedPayload = {
    userId: string;
    avatarSheetFileId: string | null;
};

export type NameChangedPayload = {
    userId: string;
    name: string;
};

export type ProfilePictureChangedPayload = {
    userId: string;
    profilePictureUrl: string | null;
};

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
    // An avatar went across the threshold of a room, or stepped on the cell of
    // a closed door. The server decides the state, the client only proposes.
    "room:crossed": (payload: RoomCrossedPayload) => void;
    "room:open": (payload: RoomOpenPayload) => void;
    // The avatar spawned or reloaded inside the room. Changes no door state.
    "room:present": (payload: RoomPresentPayload) => void;
    // Only an avatar that is inside the room can lock or unlock it.
    "room:lock": (payload: RoomLockPayload) => void;
    "room:unlock": (payload: RoomUnlockPayload) => void;
    "room:join-request": (payload: RoomJoinRequestPayload) => void;
    "room:join-answer": (payload: RoomJoinAnswerPayload) => void;
    // Joins the room of a template map, the only map without a space room.
    "map:join": (payload: MapJoinPayload) => void;
    "editor:acquire": (
        payload: EditorLockPayload,
        ack: (response: EditorAcquireAck) => void
    ) => void;
    "editor:heartbeat": (
        payload: EditorLockPayload,
        ack: (response: EditorAck) => void
    ) => void;
    "editor:release": (
        payload: EditorLockPayload,
        ack: (response: EditorAck) => void
    ) => void;
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
    // The sheet of a person in the room was replaced or cleared. Null means
    // the avatar was cleared and the person goes back to the ghost.
    "space:avatar-changed": (payload: AvatarChangedPayload) => void;
    // A person in the room renamed themselves, so the tag over their avatar
    // changes with no refresh.
    "space:name-changed": (payload: NameChangedPayload) => void;
    // A person in the room changed or removed their profile picture. Null
    // means the picture was removed and the initial shows again.
    "space:profile-picture-changed": (
        payload: ProfilePictureChangedPayload
    ) => void;
    // A person asked to enter the space as a guest. Only the hosts hear it.
    "space:guest-requested": (payload: SpaceGuestRequestedPayload) => void;
    // The answer to the request of a guest, sent to that guest alone.
    "space:guest-status": (payload: SpaceGuestStatusPayload) => void;
    // A request of the space was answered, expired or reopened. Only the
    // hosts hear it, to refresh the list they act on.
    "space:guest-updated": (payload: SpaceGuestUpdatedPayload) => void;
    // The guest lost the access (kicked, expired or guest access turned off).
    "space:guest-removed": (payload: SpaceGuestRemovedPayload) => void;
    "webrtc:signal": (payload: WebrtcSignalOutput) => void;
    "room:state": (payload: RoomStatePayload) => void;
    "room:states": (payload: RoomStatesPayload) => void;
    "room:join-requested": (payload: RoomJoinRequestedPayload) => void;
    "room:join-cancelled": (payload: RoomJoinCancelledPayload) => void;
    "room:join-decision": (payload: RoomJoinDecisionPayload) => void;
    "room:entitlements": (payload: RoomEntitlementsPayload) => void;
    "chat:unread-changed": (payload: ChatUnreadChangedPayload) => void;
    "chat:message-seen": (payload: ChatMessageSeenPayload) => void;
    // Sent to the editing session that lost its lock (expired, or taken over
    // by another session of the same person).
    "editor:lock_lost": (payload: EditorLockLostPayload) => void;
} & MapServerEvents;
