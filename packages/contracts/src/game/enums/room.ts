// The state shared by every door of one room (a `private` zone of the map).
export const ROOM_DOOR_STATES = {
    OPEN: "open",
    CLOSED: "closed",
    LOCKED: "locked",
} as const;

export type RoomDoorState =
    (typeof ROOM_DOOR_STATES)[keyof typeof ROOM_DOOR_STATES];

// Which way an avatar went across the threshold of a room.
export const ROOM_CROSS_DIRECTIONS = {
    IN: "in",
    OUT: "out",
} as const;

export type RoomCrossDirection =
    (typeof ROOM_CROSS_DIRECTIONS)[keyof typeof ROOM_CROSS_DIRECTIONS];
