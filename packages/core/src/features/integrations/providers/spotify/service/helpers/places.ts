import { SPOTIFY_MAX_CONNECTIONS } from "@standin/contracts";

/**
 * Whether every place of the app is taken for someone who holds none. A person
 * who is already connected keeps their place, so connecting again is never
 * refused.
 */
export const hasNoPlaceLeft = (
    isConnected: boolean,
    total: number
): boolean => {
    if (isConnected) return false;

    return total >= SPOTIFY_MAX_CONNECTIONS;
};
