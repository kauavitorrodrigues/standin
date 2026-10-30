// Clients start the audio after the ack reaches them, so the server keeps the
// play open a little past the clip, and the clip is never cut short.
export const PLAYBACK_GRACE_MS = 400;

// Past this many people the cooldown map is cleaned of expired entries.
export const COOLDOWN_PRUNE_THRESHOLD = 1_000;
