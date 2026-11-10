import { SPOTIFY_RESULT_STORAGE_KEY } from "../consts/storage";

/** Keeps the result until the app shows it. Storage may be blocked. */
export const storeSpotifyResult = (result: string): void => {
    try {
        sessionStorage.setItem(SPOTIFY_RESULT_STORAGE_KEY, result);
    } catch {
        // Without storage the person just sees no message.
    }
};

/** The kept result, once: reading it clears it. */
export const takeSpotifyResult = (): string | null => {
    try {
        const value = sessionStorage.getItem(SPOTIFY_RESULT_STORAGE_KEY);
        sessionStorage.removeItem(SPOTIFY_RESULT_STORAGE_KEY);
        return value;
    } catch {
        return null;
    }
};
