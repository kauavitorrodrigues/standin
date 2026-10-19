export const REMOTE_AVATAR_APPEARANCE = {
    // A remote avatar closer than this to the position it is gliding to counts
    // as standing still, in px. Under it the smoothing is only settling.
    MOVING_THRESHOLD_PX: 1,
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
