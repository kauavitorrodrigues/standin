import { z } from "zod/v4";
import { SpotifyResponseErrorMessages } from "./consts/error-messages";

// The id is always read. The photo is only a nicety: Spotify removed most
// fields of `/me` for apps in development mode, so it may not come.
export const ProfileResponseSchema = z.object({
    id: z
        .string({ error: SpotifyResponseErrorMessages.profile.id })
        .min(1, { error: SpotifyResponseErrorMessages.profile.id }),
    images: z.array(z.object({ url: z.string() })).optional(),
});
