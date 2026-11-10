import { rememberReturnPath } from "@/features/auth/lib/returnTo";
import { buildConnectUrl } from "./spotifyApi";

/**
 * Takes the person to Spotify and Spotify brings them back. The page they are
 * on is kept, so they land in the same space afterwards. Connecting again
 * replaces the connection of the person, which also refreshes what it knows
 * (the Spotify photo).
 */
export const startSpotifyConnect = (organizationId: string): void => {
    rememberReturnPath(`${window.location.pathname}${window.location.search}`);
    window.location.assign(buildConnectUrl(organizationId));
};
