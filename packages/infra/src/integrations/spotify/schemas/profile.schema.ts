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

// A track is shown with its first cover and artists. The type is read first,
// because an ad or an episode has no artists to show.
export const CurrentlyPlayingResponseSchema = z.object({
    is_playing: z.boolean({
        error: SpotifyResponseErrorMessages.playback.invalid,
    }),
    currently_playing_type: z.string({
        error: SpotifyResponseErrorMessages.playback.invalid,
    }),
    item: z
        .object({
            id: z.string().min(1),
            name: z.string(),
            artists: z.array(z.object({ name: z.string() })),
            album: z.object({ images: z.array(z.object({ url: z.string() })) }),
            external_urls: z.object({ spotify: z.string() }),
        })
        .nullable(),
});
