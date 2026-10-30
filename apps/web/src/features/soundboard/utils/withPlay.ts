import type { PlaysByPlayId } from "../types/playback";

/** The plays with one more running. */
export const withPlay = (
    plays: PlaysByPlayId,
    playId: string,
    clipId: string
): PlaysByPlayId => new Map(plays).set(playId, clipId);
