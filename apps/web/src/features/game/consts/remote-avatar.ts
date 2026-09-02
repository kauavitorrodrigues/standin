export const REMOTE_AVATAR_APPEARANCE = {
    RADIUS: 8,
    COLOR: 0x38bdf8,
    DEPTH: 20,
    DEFAULT_ALPHA: 1,
    SITTING_ALPHA: 0.6,
    DIRECTION_INDICATOR_RADIUS: 2,
    DIRECTION_INDICATOR_COLOR: 0x0c4a6e,
    // Exponential smoothing rate (1/s) towards the latest network position.
    // Smooths out the visible steps between throttled position updates
    // instead of snapping the avatar to each one. Applied per frame as
    // `1 - e^(-POSITION_LERP_RATE * delta / MS_PER_SECOND)` so convergence
    // speed is frame-rate independent (unlike a fixed per-frame lerp
    // factor, which converges faster at higher FPS).
    // Tied to multiplayer/consts/sync.ts's SEND_INTERVAL_MS (80ms) by
    // design, not a coincidence: the time constant (1/rate ≈ 83ms) should
    // track the send interval. Raising this well past that makes the
    // avatar reach each target and stall until the next packet,
    // reintroducing the per-packet stepping this smoothing exists to hide.
    POSITION_LERP_RATE: 12,
} as const;
