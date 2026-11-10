import {
    SpotifyAccountNotAllowedError,
    SpotifyUnavailableError,
} from "@standin/contracts";
import {
    SPOTIFY_NOT_ALLOWED_STATUS,
    SPOTIFY_OK_STATUS,
    SpotifyRoutes,
} from "../consts";
import { ProfileResponseSchema } from "../schemas";
import type { SpotifyProfile } from "../types";
import { requestSpotify } from "../utils/requestSpotify";

/**
 * Who the access token belongs to. Spotify answers 403 for an account that is
 * not on the list of the app, which is a `SpotifyAccountNotAllowedError`.
 */
export const getProfile = async (
    accessToken: string
): Promise<SpotifyProfile> => {
    const { status, body } = await requestSpotify(SpotifyRoutes.profile, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (status === SPOTIFY_NOT_ALLOWED_STATUS) {
        throw new SpotifyAccountNotAllowedError();
    }
    if (status !== SPOTIFY_OK_STATUS) throw new SpotifyUnavailableError();

    const parsed = ProfileResponseSchema.safeParse(body);
    if (!parsed.success) throw new SpotifyUnavailableError();

    return {
        id: parsed.data.id,
        imageUrl: parsed.data.images?.[0]?.url ?? null,
    };
};
