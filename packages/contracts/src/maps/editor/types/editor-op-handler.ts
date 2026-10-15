import type { EditorOp } from "../schemas/editorOp.schema";
import type { ApplyEditorOpResult } from "./apply-editor-op-result";
import type { EditorModel } from "./editor-model";

// Applies one kind of operation. Never mutates the model it receives.
export type EditorOpHandler<T extends EditorOp = EditorOp> = (
    model: EditorModel,
    op: T
) => ApplyEditorOpResult;

export type EditorOpType = EditorOp["type"];

// Only the operation types that already have an implementation.
export type EditorOpHandlers = {
    [K in EditorOpType]?: EditorOpHandler<Extract<EditorOp, { type: K }>>;
};
