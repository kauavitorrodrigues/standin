import { SOUNDBOARD_MIN_DURATION_MS } from "@standin/contracts";
import type { TrimEdge, TrimRange } from "../types/trim";

/**
 * Moves one handle of the selection to `ms`, never past the other handle and
 * keeping the shortest allowed clip between them.
 */
export const moveEdge = (
    edge: TrimEdge,
    ms: number,
    range: TrimRange
): TrimRange => {
    if (edge === "startMs") {
        return {
            startMs: Math.min(ms, range.endMs - SOUNDBOARD_MIN_DURATION_MS),
            endMs: range.endMs,
        };
    }
    return {
        startMs: range.startMs,
        endMs: Math.max(ms, range.startMs + SOUNDBOARD_MIN_DURATION_MS),
    };
};
