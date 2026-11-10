import { SpotifyUnavailableError } from "@standin/contracts";
import { SPOTIFY_REQUEST_TIMEOUT_MS } from "../consts/http";
import type { SpotifyResponse } from "../types";

/**
 * One call to Spotify. It answers with the status and the JSON body (null when
 * there is none), whatever the status is: the operations decide what a 400 or a
 * 403 means. A network error, a timeout or a redirect is a
 * `SpotifyUnavailableError`; the detail goes to the log only, and never the
 * credentials.
 */
export const requestSpotify = async (
    url: string,
    init: RequestInit
): Promise<SpotifyResponse> => {
    try {
        const response = await fetch(url, {
            ...init,
            redirect: "error",
            signal: AbortSignal.timeout(SPOTIFY_REQUEST_TIMEOUT_MS),
        });
        const body: unknown = await response.json().catch(() => null);

        return { status: response.status, body };
    } catch (cause) {
        console.error("[Spotify] request failed:", url, cause);
        throw new SpotifyUnavailableError();
    }
};
