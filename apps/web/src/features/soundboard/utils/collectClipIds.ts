import type { PlaysByPlayId } from "../types/playback";

/** The clips with at least one play running: a clip playing twice is in once. */
export const collectClipIds = (plays: PlaysByPlayId): ReadonlySet<string> =>
    new Set(plays.values());
