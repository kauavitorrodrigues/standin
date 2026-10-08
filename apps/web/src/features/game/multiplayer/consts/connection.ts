export const JOIN_TIMEOUT_MS = 5000;

// How long an ICE connection may sit in "disconnected" before it's treated
// as broken and an ICE restart is attempted. "disconnected" often heals by
// itself within a few seconds (a Wi-Fi roam, a brief packet loss).
export const ICE_DISCONNECTED_GRACE_MS = 4000;

// Delay before ICE restart attempt N is base * 2^N.
export const ICE_RESTART_BASE_DELAY_MS = 1000;

// After this many failed restarts the link gives up and reports itself
// closed, instead of retrying forever against a peer that's really gone.
export const ICE_RESTART_MAX_ATTEMPTS = 4;

// Both sides create the data channel with the same explicit id ("negotiated"),
// so neither needs to wait for the other's ondatachannel and there is no
// initiator-only setup step to race against.
export const DATA_CHANNEL_LABEL = "data";
export const DATA_CHANNEL_ID = 0;
