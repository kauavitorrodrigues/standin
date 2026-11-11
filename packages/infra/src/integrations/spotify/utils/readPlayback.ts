import { SpotifyUnavailableError } from "@standin/contracts";
import { SPOTIFY_TRACK_TYPE } from "../consts";
import { CurrentlyPlayingResponseSchema } from "../schemas";
import type { SpotifyPlayback } from "../types";

type CurrentlyPlaying = ReturnType<typeof CurrentlyPlayingResponseSchema.parse>;

// An ad, a podcast episode or an item Spotify does not describe is not a track
// to show.
const isShowableTrack = ({ currently_playing_type, item }: CurrentlyPlaying) =>
    currently_playing_type === SPOTIFY_TRACK_TYPE && item !== null;

/**
 * The track in the body of a 200, or null when there is nothing to show. A
 * body that is not what Spotify documents is a `SpotifyUnavailableError`.
 */
export const readPlayback = (body: unknown): SpotifyPlayback | null => {
    // A 200 with no body is the same as nothing playing.
    if (body === null) return null;

    const parsed = CurrentlyPlayingResponseSchema.safeParse(body);
    if (!parsed.success) throw new SpotifyUnavailableError();
    if (!isShowableTrack(parsed.data) || parsed.data.item === null) return null;

    const { item, is_playing } = parsed.data;

    return {
        trackId: item.id,
        title: item.name,
        artists: item.artists.map((artist) => artist.name),
        coverUrl: item.album.images[0]?.url ?? null,
        url: item.external_urls.spotify,
        isPlaying: is_playing,
    };
};
