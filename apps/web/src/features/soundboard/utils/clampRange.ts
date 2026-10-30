import { clamp } from "@/utils/clamp";
import type { TrimRange } from "../types/trim";

/** A range kept inside the source, with its edges in order. */
export const clampRange = (range: TrimRange, durationMs: number): TrimRange => {
    const startMs = clamp(range.startMs, 0, durationMs);
    const endMs = clamp(range.endMs, 0, durationMs);
    return {
        startMs: Math.min(startMs, endMs),
        endMs: Math.max(startMs, endMs),
    };
};
