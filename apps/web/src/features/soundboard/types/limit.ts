export type ClipLimitIssue = "EMPTY" | "TOO_SHORT" | "TOO_LONG" | "TOO_BIG";

export type ClipLimitMessages = Readonly<Record<ClipLimitIssue, string>>;

export type ClipLimitReport = {
    durationMs: number;
    estimatedBytes: number;
    issues: ClipLimitIssue[];
};
