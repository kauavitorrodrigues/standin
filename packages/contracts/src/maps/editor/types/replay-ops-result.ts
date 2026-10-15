import type { LayoutIssue } from "../../layout/issues";
import type { EditorModel } from "./editor-model";

export type ReplayOpsResult =
    | { ok: true; model: EditorModel }
    | { ok: false; opIndex: number; errors: LayoutIssue[] };
