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
} from "../schemas/space";
import type {
    SpaceEmoteSchema,
    SpaceNearbyMessageSchema,
    SpaceNearbyTypingSchema,
    SpacePositionSchema,
} from "../schemas/realtime";
import type { EnteredTuple, PositionTuple } from "../position-codec";
import type {
    EditorAcquireAck,
    EditorAck,
    EditorLockLostPayload,
    EditorLockPayload,
} from "../../maps/editor/types";
import type { z } from "zod/v4";
import type {
    MediaCapabilitiesAck,
    MediaCloseProducerInput,
    MediaConnectTransportInput,
    MediaConsumerClosedPayload,
    MediaConsumerPausedPayload,
    MediaConsumerResumedPayload,
    MediaHiddenVideoChangedPayload,
    MediaConsumerNewPayload,
    MediaConsumerReadyInput,
    MediaCreateTransportAck,
    MediaCreateTransportInput,
    MediaOkAck,
    MediaProducerDemandPayload,
    MediaProduceAck,
    MediaRestartIceAck,
    MediaRestartIceInput,
    MediaProduceInput,
    MediaSetFocusInput,
    MediaSetLowQualityInput,
    MediaSetMutedInput,
    MediaSetHiddenVideoInput,
    MediaSetPinsInput,
    MediaSetPrivacyInput,
    MediaPrivacyChangedPayload,
    MediaSpeakersPayload,
    MediaStateChangedPayload,
} from "../../media/types";
import type { SpaceSettings } from "../../spaces/types/space-settings";
import type {
    SpaceGuestRemovedPayload,
    SpaceGuestRequestedPayload,
    SpaceGuestStatusPayload,
    SpaceGuestUpdatedPayload,
} from "../../spaces/guests/types";
import type {
    ChatMessageCreatedPayload,
    ChatMessageDeletedPayload,
    ChatMessageSeenPayload,
    ChatMessageUpdatedPayload,
    ChatReactionToggledPayload,
    ChatTypingInput,
    ChatTypingPayload,
} from "../../chat/types/events";

export const SpaceEvents = {
    SPACE_JOIN: "space:join",
    SPACE_JOINED: "space:joined",
    SPACE_PEER_JOINED: "space:peer-joined",
    SPACE_PEER_LEFT: "space:peer-left",
    SPACE_DUPLICATE_SESSION: "space:duplicate-session",
    SPACE_AVATAR_CHANGED: "space:avatar-changed",
    SPACE_NAME_CHANGED: "space:name-changed",
    SPACE_SETTINGS_CHANGED: "space:settings-changed",
    SPACE_GUEST_REQUESTED: "space:guest-requested",
    SPACE_GUEST_STATUS: "space:guest-status",
    SPACE_GUEST_REMOVED: "space:guest-removed",
    SPACE_GUEST_UPDATED: "space:guest-updated",
    SPACE_PROFILE_PICTURE_CHANGED: "space:profile-picture-changed",
    SPACE_POSITION: "space:position",
    SPACE_POSITIONS: "space:positions",
    SPACE_EMOTE: "space:emote",
    SPACE_NEARBY_MESSAGE: "space:nearby-message",
    SPACE_NEARBY_TYPING: "space:nearby-typing",
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
export type SpacePositionInput = z.infer<typeof SpacePositionSchema>;
export type SpaceEmoteInput = z.infer<typeof SpaceEmoteSchema>;
export type SpaceNearbyMessageInput = z.infer<typeof SpaceNearbyMessageSchema>;
export type SpaceNearbyTypingInput = z.infer<typeof SpaceNearbyTypingSchema>;

// What changed around one person since the last tick, and nothing else. `entered`
// carries the full state of someone who came into their interest area, `moved`
// the people already known who changed, and `left` the ones who went out of it
// or out of the space. People are named by the short id of the tuple, and the
// socket id comes only once, in `entered`.
export type SpacePositionsPayload = {
    entered: EnteredTuple[];
    moved: PositionTuple[];
    left: number[];
};

// The sender is the socket the server saw it come from, never a field the
// client wrote.
export type SpaceEmoteOutput = SpaceEmoteInput & { socketId: string };
export type SpaceNearbyMessageOutput = SpaceNearbyMessageInput & {
    socketId: string;
};
export type SpaceNearbyTypingOutput = SpaceNearbyTypingInput & {
    socketId: string;
};

export type SpaceJoinedPayload = {
    peers: RemotePlayer[];
    settings: SpaceSettings;
};

export type SpaceSettingsChangedPayload = {
    settings: SpaceSettings;
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

export type ClientToServerEvents = {
    "space:join": (payload: SpaceJoinPayload) => void;
    // Where the avatar is now. Sent when it changed, volatile: a lost one is
    // replaced by the next.
    "space:position": (payload: SpacePositionInput) => void;
    "space:emote": (payload: SpaceEmoteInput) => void;
    "space:nearby-message": (payload: SpaceNearbyMessageInput) => void;
    "space:nearby-typing": (payload: SpaceNearbyTypingInput) => void;
    "chat:typing": (payload: ChatTypingInput) => void;
    "media:get-capabilities": (
        ack: (response: MediaCapabilitiesAck) => void
    ) => void;
    // Drops every transport, producer and consumer of this socket, so the
    // client can build its media session again from nothing.
    "media:restart": (ack: (response: MediaOkAck) => void) => void;
    // New ICE parameters for a transport, to recover it without a new session.
    "media:restart-ice": (
        payload: MediaRestartIceInput,
        ack: (response: MediaRestartIceAck) => void
    ) => void;
    "media:create-transport": (
        payload: MediaCreateTransportInput,
        ack: (response: MediaCreateTransportAck) => void
    ) => void;
    "media:connect-transport": (
        payload: MediaConnectTransportInput,
        ack: (response: MediaOkAck) => void
    ) => void;
    "media:produce": (
        payload: MediaProduceInput,
        ack: (response: MediaProduceAck) => void
    ) => void;
    "media:close-producer": (
        payload: MediaCloseProducerInput,
        ack: (response: MediaOkAck) => void
    ) => void;
    "media:consumer-ready": (
        payload: MediaConsumerReadyInput,
        ack: (response: MediaOkAck) => void
    ) => void;
    // The cameras this one shows in a tile big enough to need more than the
    // low layer, each with the layer the tile calls for.
    "media:set-focus": (payload: MediaSetFocusInput) => void;
    // The people this one pinned, who keep a video slot while close enough.
    "media:set-pins": (payload: MediaSetPinsInput) => void;
    "media:set-hidden-video": (payload: MediaSetHiddenVideoInput) => void;
    // A weak machine asks for the low layer and fewer streams.
    "media:set-low-quality": (payload: MediaSetLowQualityInput) => void;
    "media:set-muted": (payload: MediaSetMutedInput) => void;
    // The privacy modes: headphones cut every connection, focus is shown.
    "media:set-privacy": (payload: MediaSetPrivacyInput) => void;
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
    // The owner saved the settings of the space, so the controls that depend
    // on them change with no refresh.
    "space:settings-changed": (payload: SpaceSettingsChangedPayload) => void;
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
    // The positions that changed around this person, once per tick.
    "space:positions": (payload: SpacePositionsPayload) => void;
    "space:emote": (payload: SpaceEmoteOutput) => void;
    "space:nearby-message": (payload: SpaceNearbyMessageOutput) => void;
    "space:nearby-typing": (payload: SpaceNearbyTypingOutput) => void;
    "room:state": (payload: RoomStatePayload) => void;
    "room:states": (payload: RoomStatesPayload) => void;
    "room:join-requested": (payload: RoomJoinRequestedPayload) => void;
    "room:join-cancelled": (payload: RoomJoinCancelledPayload) => void;
    "room:join-decision": (payload: RoomJoinDecisionPayload) => void;
    "room:entitlements": (payload: RoomEntitlementsPayload) => void;
    "chat:message-seen": (payload: ChatMessageSeenPayload) => void;
    "chat:message-created": (payload: ChatMessageCreatedPayload) => void;
    "chat:message-updated": (payload: ChatMessageUpdatedPayload) => void;
    "chat:message-deleted": (payload: ChatMessageDeletedPayload) => void;
    "chat:reaction-toggled": (payload: ChatReactionToggledPayload) => void;
    "chat:typing": (payload: ChatTypingPayload) => void;
    "media:consumer-new": (payload: MediaConsumerNewPayload) => void;
    "media:consumer-closed": (payload: MediaConsumerClosedPayload) => void;
    "media:consumer-paused": (payload: MediaConsumerPausedPayload) => void;
    "media:consumer-resumed": (payload: MediaConsumerResumedPayload) => void;
    "media:hidden-video-changed": (
        payload: MediaHiddenVideoChangedPayload
    ) => void;
    "media:producer-demand": (payload: MediaProducerDemandPayload) => void;
    "media:speakers": (payload: MediaSpeakersPayload) => void;
    "media:state-changed": (payload: MediaStateChangedPayload) => void;
    "media:privacy-changed": (payload: MediaPrivacyChangedPayload) => void;
    // The media server restarted, so the client builds its device again.
    "media:reset": () => void;
    // Sent to the editing session that lost its lock (expired, or taken over
    // by another session of the same person).
    "editor:lock_lost": (payload: EditorLockLostPayload) => void;
} & MapServerEvents;
