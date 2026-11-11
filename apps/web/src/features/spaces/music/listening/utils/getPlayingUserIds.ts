import type { ListeningState } from "../types/listening";

/** The people whose music plays right now: a paused track draws no notes. */
export const getPlayingUserIds = (state: ListeningState): Set<string> =>
    new Set(
        Object.entries(state)
            .filter(([, track]) => track.isPlaying)
            .map(([userId]) => userId)
    );
