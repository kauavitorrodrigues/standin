// The scene renders on demand: 0 GL calls while it is still, at most MOVING_HZ
// render passes per second while something moves, and at most AMBIENT_HZ while
// the only thing that changes is an animation of the scenery (water, a flag).
// These are budgets: the tests fail when the cadence goes over them.
export const RENDER_ON_DEMAND = {
    MOVING_HZ: 36,
    AMBIENT_HZ: 4,
} as const;

// The key of the data of a display object that marks it as scenery that only
// animates by itself. A change in it is drawn at the ambient cadence, as long
// as nothing else changed.
export const AMBIENT_DATA_KEY = "ambient";
