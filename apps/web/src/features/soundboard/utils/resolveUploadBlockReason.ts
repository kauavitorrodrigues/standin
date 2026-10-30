import { CLIP_LIMIT_MESSAGES } from "../consts/clipLimitMessages";
import type { ClipLimitReport } from "../types/limit";

/** Why the upload is blocked by the limits, null when the clip fits. */
export const resolveUploadBlockReason = (
    report: ClipLimitReport
): string | null => {
    const [issue] = report.issues;
    if (!issue) return null;
    return CLIP_LIMIT_MESSAGES[issue];
};
