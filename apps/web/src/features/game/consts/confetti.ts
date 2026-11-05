import { EMOTE_DEPTH } from "@/features/game/consts/emote";

// The emoji that also throws the burst when it is sent as a reaction.
export const CONFETTI_PARTY_EMOJI = "🎉";

// The key throws at most one burst in this time, the first one at once.
export const CONFETTI_THROTTLE_MS = 500;

// What one peer may send before the rest is dropped. Keep in step with the
// server limit of space:confetti.
export const CONFETTI_RATE_LIMIT = { MAX_EVENTS: 3, WINDOW_MS: 1000 } as const;

// Paper-like colors, bright enough to read on the floor and on the walls.
export const CONFETTI_COLORS = [
    0xff4d6d, 0xffb703, 0x4cc9f0, 0x80ed99, 0xb388ff, 0xffffff,
] as const;

// The pieces are small rectangles drawn once per color. Speeds are px per
// second and gravity px per second squared, in world px.
export const CONFETTI_PIECE = {
    TEXTURE_KEY_PREFIX: "confetti-piece-",
    WIDTH: 6,
    HEIGHT: 4,
    PER_BURST: 28,
    // The burst fans out upward around the vertical, this wide in total.
    SPREAD_RAD: 1.5,
    SPEED_MIN: 120,
    SPEED_MAX: 280,
    GRAVITY: 380,
    // Share of the speed kept each second, so the burst opens and then falls.
    DRAG_PER_SECOND: 0.3,
    LIFE_MIN_MS: 1100,
    LIFE_MAX_MS: 1700,
    // Pieces only start to fade in the last part of their life.
    FADE_START_SHARE: 0.6,
    // Turning speed of the piece and how fast it flips like paper.
    SPIN_MAX_RAD: 8,
    FLIP_RAD_PER_SECOND_MIN: 6,
    FLIP_RAD_PER_SECOND_MAX: 14,
    // Where the burst starts, as a share of the visible body from the feet.
    SPAWN_BODY_SHARE: 0.7,
    // Pieces alive at once, apart from the emoji particles, so a burst never
    // starves the reactions and the reactions never starve a burst.
    MAX_ACTIVE: 90,
    DEPTH: EMOTE_DEPTH,
} as const;
