// `lastUsedAt` is a hint for the admin, so it is written at most this often
// instead of on every request.
export const LAST_USED_THROTTLE_MS = 60_000;

// "sit_" plus these characters, enough to tell tokens apart in a list and too
// few to guess the token.
export const TOKEN_PREFIX_LENGTH = 12;

export const TOKEN_RANDOM_BYTES = 32;
