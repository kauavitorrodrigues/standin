import type { EditorModel } from "./editor-model";
import type { PublishIssue } from "./publish-issue";

export type ValidateEditorOpsResult =
    { ok: true; model: EditorModel } | { ok: false; issues: PublishIssue[] };
