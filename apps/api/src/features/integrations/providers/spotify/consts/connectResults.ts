import {
    SPOTIFY_CONNECT_RESULTS,
    SpotifyAccountTakenError,
    SpotifyAccountNotAllowedError,
    SpotifyAuthorizationDeniedError,
    SpotifyConnectionLimitError,
    SpotifyNotConfiguredError,
    SpotifyStateInvalidError,
} from "@standin/contracts";
import type { SpotifyResultRule } from "../types";

// One entry per error the connection can end with. Any other error is a
// failure the person cannot act on.
export const RESULT_BY_ERROR: SpotifyResultRule[] = [
    [SpotifyAuthorizationDeniedError, SPOTIFY_CONNECT_RESULTS.DENIED],
    [SpotifyConnectionLimitError, SPOTIFY_CONNECT_RESULTS.LIMIT_REACHED],
    [SpotifyAccountNotAllowedError, SPOTIFY_CONNECT_RESULTS.NOT_ALLOWED],
    [SpotifyAccountTakenError, SPOTIFY_CONNECT_RESULTS.ACCOUNT_TAKEN],
    [SpotifyNotConfiguredError, SPOTIFY_CONNECT_RESULTS.NOT_CONFIGURED],
    [SpotifyStateInvalidError, SPOTIFY_CONNECT_RESULTS.STATE_INVALID],
];
