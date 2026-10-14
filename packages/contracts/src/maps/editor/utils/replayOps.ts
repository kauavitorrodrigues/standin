import type { EditorOp } from "../schemas/editorOp.schema";
import type { EditorModel } from "../types/editor-model";
import type { ReplayOpsResult } from "../types/replay-ops-result";
import { applyEditorOp } from "./applyEditorOp";

/**
 * Applies the operations in order on top of the base model. Pure: the base is
 * never mutated. Stops at the first operation that fails and answers its
 * index with the issues found.
 */
export const replayOps = (
    base: EditorModel,
    ops: EditorOp[]
): ReplayOpsResult => {
    let model = base;

    for (const [opIndex, op] of ops.entries()) {
        const result = applyEditorOp(model, op);
        if (!result.ok) {
            return { ok: false, opIndex, errors: result.errors };
        }
        model = result.model;
    }

    return { ok: true, model };
};
