import type { z } from "zod/v4";
import type {
    RoomJoinAnswerSchema,
    RoomJoinRequestSchema,
    RoomCrossedSchema,
    RoomLockSchema,
    RoomOpenSchema,
    RoomPresentSchema,
    RoomUnlockSchema,
} from "../schemas/room";
import type { RoomDoorState } from "../enums/room";

export const RoomEvents = {
    ROOM_CROSSED: "room:crossed",
    ROOM_OPEN: "room:open",
    ROOM_PRESENT: "room:present",
    ROOM_LOCK: "room:lock",
    ROOM_UNLOCK: "room:unlock",
    ROOM_STATE: "room:state",
    ROOM_STATES: "room:states",
    ROOM_JOIN_REQUEST: "room:join-request",
    ROOM_JOIN_ANSWER: "room:join-answer",
    ROOM_JOIN_REQUESTED: "room:join-requested",
    ROOM_JOIN_CANCELLED: "room:join-cancelled",
    ROOM_JOIN_DECISION: "room:join-decision",
    ROOM_ENTITLEMENTS: "room:entitlements",
} as const;

export type RoomCrossedPayload = z.infer<typeof RoomCrossedSchema>;
export type RoomOpenPayload = z.infer<typeof RoomOpenSchema>;
export type RoomPresentPayload = z.infer<typeof RoomPresentSchema>;
export type RoomLockPayload = z.infer<typeof RoomLockSchema>;
export type RoomUnlockPayload = z.infer<typeof RoomUnlockSchema>;

// The state of one room. The server sends it to the whole space on every
// change, and to the sender alone when it refuses what the sender asked.
export type RoomStatePayload = {
    roomKey: string;
    state: RoomDoorState;
};

// Every room of the space that is not open, sent to a socket right after it
// joins. A room missing from the list is open.
export type RoomStatesPayload = {
    rooms: RoomStatePayload[];
};

export type RoomJoinRequestPayload = z.infer<typeof RoomJoinRequestSchema>;
export type RoomJoinAnswerPayload = z.infer<typeof RoomJoinAnswerSchema>;

// Sent to the sockets inside a locked room when someone outside asks to join.
export type RoomJoinRequestedPayload = {
    roomKey: string;
    userId: string;
};

// Sent to the sockets inside when the one who asked left or gave up, or when
// another person inside already answered.
export type RoomJoinCancelledPayload = {
    roomKey: string;
    userId: string;
};

// Sent to the one who asked, once someone inside answered.
export type RoomJoinDecisionPayload = {
    roomKey: string;
    accepted: boolean;
};

// The rooms this user may enter while they are locked: the owner of the space
// (`all`) or the ones that already let them in. Sent on join and on change.
export type RoomEntitlementsPayload = {
    all: boolean;
    roomKeys: string[];
};
