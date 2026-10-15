import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { findTileConflicts } from "../findTileConflicts";
import { applyTileOp } from "./applyTileOp";
import { tileConflictIssues } from "./tileConflictIssues";

export const applyEditorErase: EditorOpHandler<
    Extract<EditorOp, { type: "erase" }>
> = (model, op) => {
    const conflicts = findTileConflicts(model, op);
    if (conflicts.length > 0) {
        return { ok: false, errors: tileConflictIssues(op, conflicts) };
    }
    return applyTileOp(model, op);
};
