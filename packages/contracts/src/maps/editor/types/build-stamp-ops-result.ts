import type { LayoutIssue } from "../../layout/issues";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { EditorModel } from "./editor-model";

// `model` is the one the operations produce, so a caller that only checks the
// placement does not have to replay them.
export type BuildStampOpsResult =
    | { ok: true; ops: EditorOp[]; model: EditorModel }
    | { ok: false; errors: LayoutIssue[] };
