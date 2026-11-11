import { SpotifyUnavailableError } from "@standin/contracts";
import { RefreshTokenResponseSchema } from "../schemas";
import type { SpotifyRefreshedTokens } from "../types";

/** The tokens in the body of a refresh, or a `SpotifyUnavailableError`. */
export const readRefreshedTokens = (body: unknown): SpotifyRefreshedTokens => {
    const parsed = RefreshTokenResponseSchema.safeParse(body);
    if (!parsed.success) throw new SpotifyUnavailableError();

    return {
        accessToken: parsed.data.access_token,
        refreshToken: parsed.data.refresh_token ?? null,
    };
};
