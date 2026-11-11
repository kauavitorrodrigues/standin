import {
    SpotifyAccessTokenExpiredError,
    SpotifyAccountNotAllowedError,
    SpotifyRateLimitedError,
    SpotifyUnavailableError,
} from "@standin/contracts";
import {
    SPOTIFY_NOT_ALLOWED_STATUS,
    SPOTIFY_NOTHING_PLAYING_STATUS,
    SPOTIFY_OK_STATUS,
    SPOTIFY_RATE_LIMITED_STATUS,
    SPOTIFY_UNAUTHORIZED_STATUS,
    SpotifyRoutes,
} from "../consts";
import type { SpotifyPlayback } from "../types";
import { readPlayback } from "../utils/readPlayback";
import { requestSpotify } from "../utils/requestSpotify";

const MS_PER_SECOND = 1000;

/**
 * What the person plays now, or null when nothing is shown: Spotify answers
 * 204 when nothing plays or the session is private, and an ad or a podcast
 * episode is not a track. 401 is an expired token, 403 an account the app does
 * not serve and 429 a `SpotifyRateLimitedError` with the wait Spotify asked.
 */
export const getCurrentlyPlaying = async (
    accessToken: string
): Promise<SpotifyPlayback | null> => {
    const { status, body, retryAfterSeconds } = await requestSpotify(
        SpotifyRoutes.currentlyPlaying,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    switch (status) {
        case SPOTIFY_OK_STATUS:
            return readPlayback(body);
        case SPOTIFY_NOTHING_PLAYING_STATUS:
            return null;
        case SPOTIFY_UNAUTHORIZED_STATUS:
            throw new SpotifyAccessTokenExpiredError();
        case SPOTIFY_NOT_ALLOWED_STATUS:
            throw new SpotifyAccountNotAllowedError();
        case SPOTIFY_RATE_LIMITED_STATUS:
            throw new SpotifyRateLimitedError(
                retryAfterSeconds === null
                    ? null
                    : retryAfterSeconds * MS_PER_SECOND
            );
        default:
            throw new SpotifyUnavailableError();
    }
};
