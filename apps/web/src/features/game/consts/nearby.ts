import { TILE_SIZE } from "@standin/contracts";

// How far a nearby message reaches, in tiles. 12 is the long preset of Gather.
// It is not the radius of the voice (MAX_AUDIBLE_RADIUS), which stays as it is.
export const NEARBY_RADIUS_TILES = 12;

// On a small map the radius shrinks, but never under the short preset of
// Gather.
export const NEARBY_RADIUS_MIN_TILES = 5;

// The radius never covers more than this share of the shorter side of the map.
export const NEARBY_MAP_MAX_SHARE = 0.5;

export const NEARBY_RADIUS_MAX_PX = NEARBY_RADIUS_TILES * TILE_SIZE;
export const NEARBY_RADIUS_MIN_PX = NEARBY_RADIUS_MIN_TILES * TILE_SIZE;

// A person that is typing shows the dots until this long after the last event.
export const NEARBY_TYPING_EXPIRY_MS = 3000;

// The most often the typing event goes out while the text changes.
export const NEARBY_TYPING_THROTTLE_MS = 1000;

// Where each message lives and for how long, as in Gather. `MAP` is counted per
// person, `STRIP` holds only the messages of the others, and `HISTORY` is the
// list of the panel, mine included.
export const NEARBY_CONTEXTS = {
    MAP: { timeoutMs: 5000, maxCount: 3 },
    STRIP: { timeoutMs: 7500, maxCount: 5 },
    HISTORY: { timeoutMs: 300_000, maxCount: 5 },
} as const;

export type NearbyContextName = keyof typeof NEARBY_CONTEXTS;

// What one peer may send before the rest is dropped.
export const NEARBY_RATE_LIMIT = {
    MAX_EVENTS: 3,
    WINDOW_MS: 3000,
} as const;

// The typing event is frequent by nature, so its limit is looser.
export const NEARBY_TYPING_RATE_LIMIT = {
    MAX_EVENTS: 6,
    WINDOW_MS: 3000,
} as const;

// The key of the history in the local storage, per space and person.
export const NEARBY_HISTORY_KEY_PREFIX = "nearby-history";

// The opacity of the oldest bubble of a stack that has more than one.
export const NEARBY_OPACITY_MIN = 0.4;

// PROVISIONAL: the CSS of the Gather bubble was not measured yet (see section
// 9 of the plan). Easy to swap when a print of the real one arrives.
export const NEARBY_BUBBLE = {
    // The space between the bubble and the top of the name tag, in px.
    GAP: 4,
    MAX_WIDTH: 200,
    PADDING_X: 8,
    PADDING_Y: 4,
    RADIUS: 10,
    FONT_SIZE: 12,
    LINE_HEIGHT: 16,
    FONT_WEIGHT: 500,
    // The space between the stacked bubbles.
    STACK_GAP: 2,
    TAIL_HEIGHT: 4,
    TAIL_WIDTH: 8,
    TEXT_COLOR: "#171717",
    // A new bubble rises in over this long, from this far below its place.
    ENTER_MS: 180,
    ENTER_OFFSET_Y: 6,
    // Then it floats straight up this far over its life, and fades out from
    // this share of the life on.
    FLOAT_PX: 28,
    FADE_START: 0.6,
    // A bubble draws over every name tag.
    Z_INDEX: 1_000_000,
} as const;

// PROVISIONAL: eight light colors with AA contrast against the dark text of the
// bubble. The person gets one by the hash of the id.
export const NEARBY_PALETTE = [
    "#a5f1f2",
    "#fde68a",
    "#bbf7d0",
    "#fbcfe8",
    "#ddd6fe",
    "#fed7aa",
    "#bae6fd",
    "#d9f99d",
] as const;
