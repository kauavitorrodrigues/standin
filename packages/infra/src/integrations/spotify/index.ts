import { exchangeCode } from "./operations/exchangeCode";
import { getAuthUrl } from "./operations/getAuthUrl";
import { getProfile } from "./operations/getProfile";
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
};

export type {
    SpotifyCredentials,
    SpotifyProfile,
    SpotifyTokens,
} from "./types";
