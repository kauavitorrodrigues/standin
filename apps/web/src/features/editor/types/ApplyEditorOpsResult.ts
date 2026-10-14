import type { EditorModel, EditorOp, LayoutIssue } from "@standin/contracts";

export type ApplyEditorOpsResult =
    | {
          ok: true;
          model: EditorModel;
          // Operations that undo the whole list, in the order to apply them.
          inverse: EditorOp[];
      }
    | { ok: false; errors: LayoutIssue[] };
