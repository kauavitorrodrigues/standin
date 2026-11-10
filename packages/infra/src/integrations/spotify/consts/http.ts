// Every call to Spotify gives up after this long, so a Spotify outage cannot
// hold a request of ours open.
export const SPOTIFY_REQUEST_TIMEOUT_MS = 8000;

export const SPOTIFY_GRANT_TYPES = {
    AUTHORIZATION_CODE: "authorization_code",
    CLIENT_CREDENTIALS: "client_credentials",
    REFRESH_TOKEN: "refresh_token",
} as const;
