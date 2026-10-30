import type { ClipLimitReport } from "../types/limit";

/** Whether the selection is longer or bigger than a clip may be. */
export const isOverLimit = (report: ClipLimitReport): boolean =>
    report.issues.includes("TOO_LONG") || report.issues.includes("TOO_BIG");
