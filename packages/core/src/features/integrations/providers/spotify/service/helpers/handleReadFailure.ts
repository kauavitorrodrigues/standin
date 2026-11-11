import { BaseError, SPOTIFY_ERROR_CODES } from "@standin/contracts";
import type { SpotifyConnectionKey } from "../../types";
import { dropRevokedConnection } from "./dropRevokedConnection";

/**
 * What a failed read means for the person. The failures that show nothing give
 * null; the rest (a 429, Spotify being down) go to the caller.
 */
export const handleReadFailure = async (
    key: SpotifyConnectionKey,
    error: unknown
): Promise<null> => {
    const code = error instanceof BaseError ? error.code : null;

    switch (code) {
        case SPOTIFY_ERROR_CODES.ACCESS_REVOKED:
            await dropRevokedConnection(key);
            return null;
        // The owner fixes the app, and an account outside the list never shows.
        case SPOTIFY_ERROR_CODES.CREDENTIALS_INVALID:
        case SPOTIFY_ERROR_CODES.ACCOUNT_NOT_ALLOWED:
            return null;
        default:
            throw error;
    }
};
