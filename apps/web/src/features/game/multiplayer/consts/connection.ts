import { SpaceSettingsSchema, type SpaceSettings } from "@standin/contracts";
export const JOIN_TIMEOUT_MS = 5000;

// How long an ICE connection may sit in "disconnected" before it's treated
// as broken and an ICE restart is attempted. "disconnected" often heals by
// itself within a few seconds (a Wi-Fi roam, a brief packet loss). 10 s is
// the grace period.
export const ICE_DISCONNECTED_GRACE_MS = 10000;

// Backoff curve shared by ICE restarts and socket reconnection. The delay is:
// delay = min(1000 * 2^attempt, MAX_DELAY_MS) + (2 * random - 1) * JITTER_MS.
export const BACKOFF_BASE_DELAY_MS = 1000;
export const MAX_DELAY_MS = 10000;
export const JITTER_MS = 1000;

// socket.io-client options approximating the same curve. The library applies
// jitter as a fraction of the delay, so 0.5 only approximates the fixed
// +-1000 ms of backoffDelay.
export const SOCKET_RECONNECTION_OPTIONS = {
    reconnectionDelay: BACKOFF_BASE_DELAY_MS,
    reconnectionDelayMax: MAX_DELAY_MS,
    randomizationFactor: 0.5,
} as const;

// Sliding window used by AttemptRateTracker. The window is 30 s.
export const ATTEMPT_RATE_WINDOW_MS = 30000;

// Our own give-up threshold. 8 attempts per window is an assumption, not
// a measured value.
export const ATTEMPT_RATE_MAX_ATTEMPTS = 8;

// What a space reads before the join answers. The schema owns the defaults.
export const DEFAULT_SPACE_SETTINGS: SpaceSettings = SpaceSettingsSchema.parse(
    {}
);

// How many ICE restarts of one transport are tried before the whole media
// session is built again.
export const ICE_RESTART_MAX_ATTEMPTS = 4;

// How long a transport gets to be connected again after an ICE restart.
export const ICE_RESTART_CONNECT_TIMEOUT_MS = 10000;
