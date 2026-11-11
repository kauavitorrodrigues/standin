import { z } from "zod/v4";
import { SpotifyResponseErrorMessages } from "./consts/error-messages";

export const AccessTokenResponseSchema = z.object({
    access_token: z
        .string({ error: SpotifyResponseErrorMessages.accessToken.required })
        .min(1, { error: SpotifyResponseErrorMessages.accessToken.required }),
});

// The answer to a refresh. Spotify sends a new refresh token only sometimes.
export const RefreshTokenResponseSchema = AccessTokenResponseSchema.extend({
    refresh_token: z
        .string({ error: SpotifyResponseErrorMessages.refreshToken.required })
        .min(1, { error: SpotifyResponseErrorMessages.refreshToken.required })
        .optional(),
});

// The answer to the code exchange. Spotify gives the refresh token here only.
export const AuthorizationTokenResponseSchema =
    AccessTokenResponseSchema.extend({
        refresh_token: z
            .string({
                error: SpotifyResponseErrorMessages.refreshToken.required,
            })
            .min(1, {
                error: SpotifyResponseErrorMessages.refreshToken.required,
            }),
        scope: z
            .string({ error: SpotifyResponseErrorMessages.scope.invalid })
            .default(""),
    });

export type AuthorizationTokenResponse = z.infer<
    typeof AuthorizationTokenResponseSchema
>;

// The body of a 400 from the token endpoint.
export const TokenErrorResponseSchema = z.object({
    error: z.string({ error: SpotifyResponseErrorMessages.error.invalid }),
});
