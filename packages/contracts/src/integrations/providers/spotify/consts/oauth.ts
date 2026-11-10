// Only what the now playing widget needs.
export const SPOTIFY_SCOPES = ["user-read-currently-playing"] as const;

// Fixed codes the web receives in `?spotify=` after the callback. They never
// carry the message of Spotify.
export const SPOTIFY_CONNECT_RESULTS = {
    CONNECTED: "connected",
    DENIED: "denied",
    LIMIT_REACHED: "limit_reached",
    NOT_ALLOWED: "not_allowed",
    NOT_CONFIGURED: "not_configured",
    STATE_INVALID: "state_invalid",
    FAILED: "failed",
} as const;

export type SpotifyConnectResult =
    (typeof SPOTIFY_CONNECT_RESULTS)[keyof typeof SPOTIFY_CONNECT_RESULTS];
