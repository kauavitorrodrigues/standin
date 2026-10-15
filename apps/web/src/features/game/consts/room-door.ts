// The first frame of a door animation is the door closed, the last one open.
export const ROOM_DOOR_FRAMES = {
    CLOSED: 0,
    // A door needs at least this many frames to have an open and a closed look.
    MIN_ANIMATED_COUNT: 2,
} as const;

export const ROOM_DOOR_PADLOCK = {
    TEXTURE_KEY: "room-door-padlock",
    // The PNG is 64x64 with transparent margin. The visible padlock spans
    // x 21..42 and y 27..54, so its center is the origin of the image.
    ORIGIN_X: 32 / 64,
    ORIGIN_Y: 41 / 64,
    // Scale that makes the 22 px wide padlock about 20 px wide on screen.
    SCALE: 20 / 22,
    // The padlock draws just over the door sprite.
    DEPTH_OFFSET: 0.0001,
} as const;

// Keeps the bodies of the doors apart from the ones of the objects, since a
// door is also a placed object with its own id.
export const ROOM_DOOR_COLLIDER_PREFIX = "room-door:";

// How far from the cell of a locked door the avatar counts as near it, in px.
export const ROOM_DOOR_NEAR_REACH_PX = 32;
