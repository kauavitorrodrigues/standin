// How often the server asks Spotify what a person plays. Each poll is one call
// per connected person who is online in a space.
export const LISTENING_POLL_INTERVAL_MS = 10_000;

// A track paused for longer than this is no longer shown, so a forgotten tab
// does not show a song for hours.
export const LISTENING_PAUSE_LIMIT_MS = 5 * 60_000;

// The wait after a 429 that has no Retry-After, or one that is too long to
// trust.
export const LISTENING_DEFAULT_BACKOFF_MS = 30_000;
export const LISTENING_MAX_BACKOFF_MS = 5 * 60_000;
