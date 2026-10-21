export const OAUTH_STATE_COOKIE = "oauth_github";

// The person has this long to authorize on GitHub and come back.
export const OAUTH_STATE_COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

// `state` and the PKCE verifier are base64url, so this never appears in them.
export const OAUTH_STATE_COOKIE_SEPARATOR = ".";

export const OAUTH_RANDOM_BYTES = 32;
