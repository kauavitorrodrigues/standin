export const MOVEMENT_HOLD = {
    // How long a movement key is held before the avatar walks. A shorter
    // press only turns it to face that way.
    DELAY_MS: 60,
    // A key pressed this soon after the avatar was walking skips the hold, so
    // changing direction on the move stays smooth.
    CHAIN_GRACE_MS: 100,
} as const;
