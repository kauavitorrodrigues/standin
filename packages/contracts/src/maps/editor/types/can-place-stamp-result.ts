import type { LayoutIssueCode } from "../../layout/issues";

export type CanPlaceStampResult =
    { ok: true } | { ok: false; reason: LayoutIssueCode };
