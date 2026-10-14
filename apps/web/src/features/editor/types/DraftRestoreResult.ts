import type { LayoutIssue } from "@standin/contracts";

export type DraftRestoreResult =
    { ok: true } | { ok: false; opIndex: number; errors: LayoutIssue[] };
