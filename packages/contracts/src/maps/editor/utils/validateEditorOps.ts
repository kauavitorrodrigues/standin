import type { EditorOp } from "../schemas/editorOp.schema";
import type { EditorModel } from "../types/editor-model";
import type { ValidateEditorOpsResult } from "../types/validate-editor-ops-result";
import { replayOps } from "./replayOps";
import { toPublishIssues } from "./toPublishIssues";
import { validateDoors } from "./validateDoors";

/**
 * The checks a draft goes through on publish, without writing anything: the
 * replay stops at the first operation that fails and answers its issues, then
 * every door of the replayed model must stand on the border of exactly one
 * private zone. The door issues point at the last operation, which is the one
 * that produced the state. The server and the tools that author maps call
 * this same function, so both answer the same issues for the same input.
 */
export const validateEditorOps = (
    base: EditorModel,
    ops: EditorOp[]
): ValidateEditorOpsResult => {
    const replayed = replayOps(base, ops);
    if (!replayed.ok) {
        return {
            ok: false,
            issues: toPublishIssues(replayed.opIndex, replayed.errors),
        };
    }

    const doorIssues = validateDoors(replayed.model);
    if (doorIssues.length > 0) {
        return {
            ok: false,
            issues: toPublishIssues(Math.max(ops.length - 1, 0), doorIssues),
        };
    }

    return { ok: true, model: replayed.model };
};
