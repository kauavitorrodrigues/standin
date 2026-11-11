// The statuses the token endpoint answers to a client ID and secret it does
// not accept.
export const SPOTIFY_REJECTED_CREDENTIALS_STATUSES: ReadonlySet<number> =
    new Set([400, 401]);

// Spotify answers 403 to an account that is not on the list of the app.
export const SPOTIFY_NOT_ALLOWED_STATUS = 403;

// The code exchange answers 400 when it refuses the code or the app.
export const SPOTIFY_CODE_REJECTED_STATUS = 400;

// The `error` of the token endpoint for a code that is used, expired or made
// for another address. Any other 400 (`invalid_client`) is the app that
// Spotify does not accept anymore.
export const SPOTIFY_INVALID_GRANT_ERROR = "invalid_grant";

export const SPOTIFY_OK_STATUS = 200;

export const SPOTIFY_NOTHING_PLAYING_STATUS = 204;
export const SPOTIFY_UNAUTHORIZED_STATUS = 401;
export const SPOTIFY_RATE_LIMITED_STATUS = 429;

// The only kind of item the widget shows. An ad, a podcast episode or an item
// Spotify does not describe is nothing.
export const SPOTIFY_TRACK_TYPE = "track";
