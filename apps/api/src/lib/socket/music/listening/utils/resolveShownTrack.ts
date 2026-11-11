import type { ResolveShownInput, ShownState } from "../types";

/**
 * What to show after a poll. A track that plays is shown. A paused track is
 * shown too, with the notes stopped, until it has been paused for
 * `pauseLimitMs`; after that nothing is shown until the music plays again.
 * Nothing playing (a private session, an ad, no device) shows nothing.
 */
export const resolveShownTrack = ({
    track,
    previous,
    now,
    pauseLimitMs,
}: ResolveShownInput): ShownState => {
    if (track === null) {
        return { visible: null, trackId: null, pausedSince: null };
    }
    if (track.isPlaying) {
        return { visible: track, trackId: track.trackId, pausedSince: null };
    }

    const wasPausedOnThisTrack =
        previous?.trackId === track.trackId && previous.pausedSince !== null;
    const pausedSince = wasPausedOnThisTrack ? previous.pausedSince : now;
    const isTooLong = now - (pausedSince ?? now) >= pauseLimitMs;

    return {
        visible: isTooLong ? null : track,
        trackId: track.trackId,
        pausedSince,
    };
};
