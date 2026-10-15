// Game events the scene emits about the room the local avatar is in. `null`
// means the avatar is in no room.
export const ROOM_EVENTS = {
    CURRENT_CHANGED: "room:current-changed",
    // The avatar is near the door of a locked room it may not enter. The
    // payload is `{ roomKey, roomLabel }`, or null when it stops being near.
    LOCKED_DOOR_NEAR: "room:locked-door-near",
} as const;
