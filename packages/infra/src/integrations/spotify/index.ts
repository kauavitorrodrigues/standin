import { exchangeCode } from "./operations/exchangeCode";
import { getCurrentlyPlaying } from "./operations/getCurrentlyPlaying";
import { getAuthUrl } from "./operations/getAuthUrl";
import { getProfile } from "./operations/getProfile";
import { refreshAccessToken } from "./operations/refreshAccessToken";
import { verifyCredentials } from "./operations/verifyCredentials";

// Everything that talks to Spotify. It has no state and reads no environment
// variable: the app belongs to an organization, so each call receives the
// credentials. The owner of the organization creates the Spotify app, see
// `docs/spotify.md`.
export const SpotifyProvider = {
    getAuthUrl,
    verifyCredentials,
    exchangeCode,
    getProfile,
    refreshAccessToken,
    getCurrentlyPlaying,
};

export type {
    SpotifyCredentials,
    SpotifyPlayback,
    SpotifyProfile,
    SpotifyRefreshedTokens,
    SpotifyTokens,
} from "./types";
