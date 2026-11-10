import { SPOTIFY_SCOPES } from "@standin/contracts";
import { SpotifyRoutes } from "../consts";
import type { GetAuthUrlInput } from "../types";

/** The Spotify page where the person allows the app of their organization. */
export const getAuthUrl = ({
    credentials,
    redirectUri,
    state,
}: GetAuthUrlInput): string => {
    const url = new URL(SpotifyRoutes.authorize);
    url.searchParams.set("client_id", credentials.clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));
    url.searchParams.set("state", state);
    // Always ask, so a click from another page cannot connect a person who
    // allowed the app before, and so they can pick another Spotify account.
    url.searchParams.set("show_dialog", "true");

    return url.toString();
};
