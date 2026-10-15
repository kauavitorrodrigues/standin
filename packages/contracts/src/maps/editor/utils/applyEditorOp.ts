import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import { LAYOUT_ISSUE_CODES as Code, createIssue } from "../../layout/issues";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { ApplyEditorOpResult } from "../types/apply-editor-op-result";
import type { EditorOpHandler } from "../types/editor-op-handler";
import type { EditorModel } from "../types/editor-model";
import { EDITOR_OP_HANDLERS } from "./ops/editorOpHandlers";

/**
 * Applies one operation to the editor model. Pure: the model is never
 * mutated, and the result carries the new model, the operations that undo
 * this one and the tile cells that changed. A type without a handler yet
 * answers OP_NOT_SUPPORTED.
 */
export const applyEditorOp = (
    model: EditorModel,
    op: EditorOp
): ApplyEditorOpResult => {
    const handler = EDITOR_OP_HANDLERS[op.type] as
        EditorOpHandler<EditorOp> | undefined;

    if (!handler) {
        return {
            ok: false,
            errors: [
                createIssue(
                    Code.OP_NOT_SUPPORTED,
                    `op.${op.type}`,
                    Messages.opNotSupported
                ),
            ],
        };
    }

    return handler(model, op);
};
