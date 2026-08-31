import Phaser from "phaser";

export const PLAYER_APPEARANCE = {
    RADIUS: 8,
    COLOR: 0xf97316,
    DEPTH: 20,
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
