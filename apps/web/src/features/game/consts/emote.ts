import { AVATAR_ANIMATIONS, AVATAR_FRAMES } from "@standin/contracts";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";

const MS_PER_SECOND = 1000;

// Emoji is a light social signal, so it is seen from a little farther than a
// voice is heard: this many times the reach of the voice of the space.
export const EMOTE_REACH_FACTOR = 2;

// How long the gesture of the avatar lasts: every frame of the emote, played
// the first time and again for each repeat of the animation.
export const EMOTE_DURATION_MS =
    (AVATAR_FRAMES.EMOTE.down.length / AVATAR_ANIMATIONS.EMOTE.fps) *
    (AVATAR_ANIMATIONS.EMOTE.repeat + 1) *
    MS_PER_SECOND;

// The floating emoji. Speeds are in px per second. Kept low so the emoji rises
// about 50 px and stays close to the avatar.
export const EMOTE_PARTICLE = {
    LIFE_MIN_MS: 1400,
    LIFE_MAX_MS: 1500,
    SPEED_X_MAX: 20,
    SPEED_Y_MIN: 60,
    SPEED_Y_MAX: 80,
    GRAVITY: 50,
    // The pause between the emojis of one combo.
    STAGGER_MS: 80,
    // Where the emoji is born, as a share of the visible body from the feet:
    // about the chest, so it rises past the head.
    SPAWN_BODY_SHARE: 0.6,
    // The emoji is drawn on a canvas of EMOTE_TEXTURE.SIZE px and shown smaller.
    SCALE: 0.5,
    // With reduced motion the emoji stays where it is and only fades.
    REDUCED_MOTION_LIFE_MS: 800,
    // Particles alive at once, so a flood of emotes cannot grow the pool.
    MAX_ACTIVE: 32,
} as const;

// Events of the game that ask for emojis to float up from a point of the map,
// for whatever has no avatar to carry them. Local to this client, nothing is
// sent to the others.
export const EMOTE_EVENTS = {
    FIRE_EMOJI: "emote:fire-emoji",
} as const;

// Over every object and avatar and the foreground layer, under the room dim.
export const EMOTE_DEPTH = PLACED_ASSET_DEPTH.FOREGROUND + 1;

// The emojis are drawn with the font of the system on a canvas, so any emoji
// works without art of its own.
export const EMOTE_TEXTURE = {
    KEY_PREFIX: "emote-emoji-",
    SIZE: 32,
    FONT_SIZE: 26,
    FONT_FAMILY:
        '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
    MAX_TEXTURES: 24,
    // A texture is only taken away after this long without being asked for.
    MIN_IDLE_MS: 5000,
} as const;

// What one peer may send before the rest is dropped.
export const EMOTE_RATE_LIMIT = {
    MAX_EVENTS: 8,
    WINDOW_MS: 1000,
} as const;
