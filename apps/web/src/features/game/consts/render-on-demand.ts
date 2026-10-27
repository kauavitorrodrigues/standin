// The scene renders on demand: 0 GL calls while it is still, about 36 render
// passes per second while the avatar walks. MOVING_HZ is that rate.
export const RENDER_ON_DEMAND = {
    MOVING_HZ: 36,
} as const;
