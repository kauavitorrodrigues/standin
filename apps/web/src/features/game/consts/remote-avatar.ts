export const REMOTE_AVATAR_APPEARANCE = {
    RADIUS: 8,
    COLOR: 0x38bdf8,
    DEPTH: 20,
    DEFAULT_ALPHA: 1,
    SITTING_ALPHA: 0.6,
    DIRECTION_INDICATOR_RADIUS: 2,
    DIRECTION_INDICATOR_COLOR: 0x0c4a6e,
    // Per-frame interpolation factor towards the latest network position -
    // smooths out the visible steps between throttled position updates
    // (SEND_INTERVAL_MS) instead of snapping the avatar to each one.
    POSITION_LERP: 0.2,
} as const;
