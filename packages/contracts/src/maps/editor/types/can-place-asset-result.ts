import type { LayoutIssueCode } from "../../layout/issues";

export type CanPlaceAssetResult =
    { ok: true } | { ok: false; reason: LayoutIssueCode };
