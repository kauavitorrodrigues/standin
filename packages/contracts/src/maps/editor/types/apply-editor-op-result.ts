import type { LayoutIssue } from "../../layout/issues";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { CellDiff } from "./cell-diff";
import type { EditorModel } from "./editor-model";

export type ApplyEditorOpResult =
    | {
          ok: true;
          model: EditorModel;
          inverse: EditorOp[];
          diff: CellDiff[];
      }
    | { ok: false; errors: LayoutIssue[] };
