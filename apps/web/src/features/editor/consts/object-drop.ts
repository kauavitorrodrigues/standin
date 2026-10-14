// The little squash an object does when the user drops it on the map: it
// presses down a touch, then settles back with a soft bounce. Short and low,
// so placing many objects never feels slow.
export const OBJECT_DROP = {
    SQUASH_SCALE_X: 1.05,
    SQUASH_SCALE_Y: 0.88,
    SQUASH_MS: 70,
    SQUASH_EASE: "Sine.easeOut",
    SETTLE_MS: 160,
    SETTLE_EASE: "Back.easeOut",
} as const;
