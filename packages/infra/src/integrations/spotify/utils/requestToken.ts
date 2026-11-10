import { SpotifyRoutes } from "../consts";
import type { SpotifyCredentials, SpotifyResponse } from "../types";
import { buildBasicAuth } from "./buildBasicAuth";
import { requestSpotify } from "./requestSpotify";

/** A call to the token endpoint with the form the grant needs. */
export const requestToken = (
    credentials: SpotifyCredentials,
    form: Record<string, string>
): Promise<SpotifyResponse> =>
    requestSpotify(SpotifyRoutes.token, {
        method: "POST",
        headers: {
            Authorization: buildBasicAuth(credentials),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(form).toString(),
    });
