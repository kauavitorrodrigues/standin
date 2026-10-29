import type { EditorModel, EditorOp } from "@standin/contracts";
import type { AuthoringIssue } from "./issue";
import type { BuildResult } from "./result";

// A step of a composition: reads the model the earlier steps left and answers
// its ops.
export type BuildStep = (model: EditorModel) => BuildResult;

export type ComposeResult =
    | { ok: true; ops: EditorOp[]; model: EditorModel }
    | {
          ok: false;
          // The step the problem belongs to. For a rule that looks at the whole
          // draft, the step of the op the server would point at.
          stepIndex: number;
          issues: AuthoringIssue[];
      };
