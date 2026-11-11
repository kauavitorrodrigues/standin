import type { ListeningTrack } from "@standin/contracts";
import { SpotifyRepository } from "../repository";
import type { SpotifyConnectionKey } from "../types";
import { fetchPlayback } from "./helpers/fetchPlayback";
import { handleReadFailure } from "./helpers/handleReadFailure";
import { findCredentials } from "./credentials";

/**
 * What the person plays now, or null for anything that shows nothing: no
 * connection, no app, a secret that cannot be opened, an account the app does
 * not serve, or nothing playing (a private session and an ad also answer
 * nothing). A 429 is thrown as a `SpotifyRateLimitedError` for the caller to
 * wait on, and an unreachable Spotify as a `SpotifyUnavailableError`.
 */
export const readSpotifyPlayback = async (
    key: SpotifyConnectionKey
): Promise<ListeningTrack | null> => {
    const connection = await SpotifyRepository.findConnection(key);
    if (!connection) return null;

    const credentials = await findCredentials(key.organizationId);
    if (!credentials) return null;

    try {
        return await fetchPlayback({
            key,
            credentials,
            refreshTokenSealed: connection.refreshTokenSealed,
        });
    } catch (error) {
        return handleReadFailure(key, error);
    }
};
