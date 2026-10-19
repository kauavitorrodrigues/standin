// How an avatar blinks while it stands still. Only the look: every client
// blinks on its own clock, nothing is sent over the network.
export const AVATAR_BLINK = {
    // How long the eyes stay closed, in ms.
    DURATION_MS: 150,
    // The wait between two blinks is random inside this range, in ms.
    MIN_INTERVAL_MS: 2500,
    MAX_INTERVAL_MS: 6000,
} as const;
