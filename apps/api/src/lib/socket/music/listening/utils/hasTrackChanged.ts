import type { ListeningTrack } from "@standin/contracts";

const isMissingOne = (
    previous: ListeningTrack | null,
    next: ListeningTrack | null
) => previous === null || next === null;

const isSameTrackAndState = (previous: ListeningTrack, next: ListeningTrack) =>
    previous.trackId === next.trackId && previous.isPlaying === next.isPlaying;

/**
 * Whether the others must be told. Only a new track, a pause or a resume,
 * and the track appearing or going away count: polling the same track again
 * sends nothing.
 */
export const hasTrackChanged = (
    previous: ListeningTrack | null,
    next: ListeningTrack | null
): boolean => {
    if (previous === null || next === null) {
        return isMissingOne(previous, next) && previous !== next;
    }

    return !isSameTrackAndState(previous, next);
};
