import { MissingEnvironmentVariableError } from "@standin/contracts";
import { SPOTIFY_CALLBACK_PATH } from "../consts";

/**
 * The address the owner registers in the Spotify app. The API does not know
 * how the browser reaches it behind a proxy, so `API_PUBLIC_URL` says (in the
 * compose stack it is the site plus `/api`). Without it the address of
 * `SERVER_URL` is used, which is right in development. Slashes repeated in
 * the middle (a `FRONTEND_URL` that ends in `/`) are collapsed.
 */
export const buildSpotifyRedirectUri = (): string => {
    const base = process.env.API_PUBLIC_URL?.trim() || process.env.SERVER_URL;
    if (!base) throw new MissingEnvironmentVariableError("SERVER_URL");

    return `${base.replace(/\/+$/, "")}${SPOTIFY_CALLBACK_PATH}`.replace(
        /([^:])\/{2,}/g,
        "$1/"
    );
};
