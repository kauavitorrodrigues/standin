import {
    SPOTIFY_ERROR_CODES,
    BaseError,
    type ListeningTrack,
} from "@standin/contracts";
import { SpotifyProvider } from "@standin/infra";
import type { PlaybackAccess } from "../../types";
import { recallAccessToken } from "./accessTokens";
import { renewAccessToken } from "./renewAccessToken";

const isExpiredToken = (error: unknown) =>
    error instanceof BaseError &&
    error.code === SPOTIFY_ERROR_CODES.ACCESS_TOKEN_EXPIRED;

// The token in memory ran out: one new token, one new try.
const fetchWithRenewedToken = async (
    access: PlaybackAccess
): Promise<ListeningTrack | null> => {
    const renewed = await renewAccessToken(access);
    if (!renewed) return null;

    return SpotifyProvider.getCurrentlyPlaying(renewed);
};

/**
 * Asks Spotify what the person plays, with the access token in memory or a
 * new one. An expired token is renewed once.
 */
export const fetchPlayback = async (
    access: PlaybackAccess
): Promise<ListeningTrack | null> => {
    const accessToken =
        recallAccessToken(access.key) ?? (await renewAccessToken(access));
    if (!accessToken) return null;

    try {
        return await SpotifyProvider.getCurrentlyPlaying(accessToken);
    } catch (error) {
        if (!isExpiredToken(error)) throw error;

        return fetchWithRenewedToken(access);
    }
};
