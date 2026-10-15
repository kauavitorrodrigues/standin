import Phaser from "phaser";

// The size of the avatar for what blocks it and what covers it, kept apart so
// a taller body can come without changing how close it gets to a wall. The
// collision stays at the feet, the body height is only what is drawn above.
export const AVATAR_DIMENSIONS = {
    COLLISION_RADIUS: 8,
    BODY_HEIGHT: 16,
} as const;

export const PLAYER_APPEARANCE = {
    RADIUS: AVATAR_DIMENSIONS.COLLISION_RADIUS,
    COLOR: 0xf97316,
    SPEAKING_RING_WIDTH: 3,
    SPEAKING_RING_COLOR: 0x22c55e,
} as const;

export const PLAYER_PHYSICS = {
    SPEED: 160,
} as const;

export const ZERO_VELOCITY = {
    x: 0,
    y: 0,
} as const;

export const ZERO_MAGNITUDE = 0;

export const PLAYER_MOVEMENT_KEY_BINDINGS = {
    UP: [Phaser.Input.Keyboard.KeyCodes.UP, Phaser.Input.Keyboard.KeyCodes.W],
    DOWN: [
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.S,
    ],
    LEFT: [
        Phaser.Input.Keyboard.KeyCodes.LEFT,
        Phaser.Input.Keyboard.KeyCodes.A,
    ],
    RIGHT: [
        Phaser.Input.Keyboard.KeyCodes.RIGHT,
        Phaser.Input.Keyboard.KeyCodes.D,
    ],
} as const;

export const PLAYER_INTERACT_KEY = Phaser.Input.Keyboard.KeyCodes.E;

export const EDITABLE_ELEMENT_TAG_NAMES = ["INPUT", "TEXTAREA"] as const;

export const FOCUS_TRACKING_EVENTS = {
    IN: "focusin",
    OUT: "focusout",
} as const;
