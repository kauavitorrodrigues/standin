import type { PlaysByPlayId } from "../types/playback";

/** The plays without the one that ended. The same map when it was not there. */
export const withoutPlay = (
    plays: PlaysByPlayId,
    playId: string
): PlaysByPlayId => {
    if (!plays.has(playId)) return plays;
    const next = new Map(plays);
    next.delete(playId);
    return next;
};
