import type { SoundboardStopped } from "@standin/contracts";
import type { PlaysByPlayId } from "../types/playback";

/**
 * Whether a stop from the server ends a play running here. A stop for a play
 * that is not ours, or that already ended here, is ignored.
 */
export const stopsLocalPlay = (
    stopped: Pick<SoundboardStopped, "playId">,
    plays: PlaysByPlayId
): boolean => plays.has(stopped.playId);
