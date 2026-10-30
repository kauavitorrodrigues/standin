import {
    SOUNDBOARD_MAX_CLIP_BYTES,
    SOUNDBOARD_MAX_DURATION_MS,
    SOUNDBOARD_MIN_DURATION_MS,
} from "@standin/contracts";
import type { ClipLimitIssue, ClipLimitReport } from "../types/limit";
import { estimateClipBytes } from "./estimateClipBytes";

/** The same limits the server enforces, so the editor can block early. */
export const checkClipLimits = (durationMs: number): ClipLimitReport => {
    const issues: ClipLimitIssue[] = [];
    const estimatedBytes = durationMs > 0 ? estimateClipBytes(durationMs) : 0;

    if (durationMs <= 0) issues.push("EMPTY");
    if (durationMs > 0 && durationMs < SOUNDBOARD_MIN_DURATION_MS) {
        issues.push("TOO_SHORT");
    }
    if (durationMs > SOUNDBOARD_MAX_DURATION_MS) issues.push("TOO_LONG");
    if (estimatedBytes > SOUNDBOARD_MAX_CLIP_BYTES) issues.push("TOO_BIG");

    return { durationMs, estimatedBytes, issues };
};
