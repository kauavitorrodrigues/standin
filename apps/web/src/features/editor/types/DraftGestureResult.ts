import type { LayoutIssue } from "@standin/contracts";

export type DraftGestureResult =
    { ok: true } | { ok: false; errors: LayoutIssue[] };
