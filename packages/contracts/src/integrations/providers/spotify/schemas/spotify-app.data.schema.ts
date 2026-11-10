import { z } from "zod/v4";
import { SpotifyErrorMessages } from "./consts/error-messages";
import {
    MAX_SPOTIFY_CLIENT_ID_LENGTH,
    MAX_SPOTIFY_CLIENT_SECRET_LENGTH,
} from "./consts/fields";

export const SpotifyAppSaveSchema = z.object({
    clientId: z
        .string({ error: SpotifyErrorMessages.clientId.required })
        .trim()
        .min(1, { error: SpotifyErrorMessages.clientId.required })
        .max(MAX_SPOTIFY_CLIENT_ID_LENGTH, {
            error: SpotifyErrorMessages.clientId.max,
        }),
    clientSecret: z
        .string({ error: SpotifyErrorMessages.clientSecret.required })
        .trim()
        .min(1, { error: SpotifyErrorMessages.clientSecret.required })
        .max(MAX_SPOTIFY_CLIENT_SECRET_LENGTH, {
            error: SpotifyErrorMessages.clientSecret.max,
        }),
});
