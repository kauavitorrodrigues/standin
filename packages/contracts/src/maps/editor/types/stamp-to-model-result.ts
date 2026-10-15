import type { LayoutIssue } from "../../layout/issues";
import type { EditorModel } from "./editor-model";

// `zoneLabel` is the name of the area zone, kept out of the model because the
// composer has no zone tool. Null when the stamp has no zone.
export type StampToModelResult =
    | { ok: true; model: EditorModel; zoneLabel: string | null }
    | { ok: false; errors: LayoutIssue[] };
