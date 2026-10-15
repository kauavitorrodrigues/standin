import type { LayoutIssue } from "../../layout/issues";
import type { Stamp } from "./stamp";

export type CaptureStampResult =
    { ok: true; stamp: Stamp } | { ok: false; errors: LayoutIssue[] };
