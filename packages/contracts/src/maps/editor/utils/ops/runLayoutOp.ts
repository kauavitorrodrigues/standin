import { MAX_CELLS_PER_OP } from "../../consts/limits";
import { applyOp } from "../../../layout/applyOp";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../../layout/issues";
import type { LayoutOp } from "../../../layout/ops.schema";
import type { MapLayout } from "../../../schemas/layout.schema";
import type { EditorModel } from "../../types/editor-model";
import { toLayoutLibrary } from "../toLayoutLibrary";

type LayoutOpRun =
    | { ok: true; layout: MapLayout }
    | { ok: false; errors: LayoutIssue[] };

/**
 * Runs an operation through the layout engine (maps/layout/applyOp), the only
 * place that knows how to change a layout. The model is left untouched.
 */
export const runLayoutOp = (model: EditorModel, op: LayoutOp): LayoutOpRun => {
    if (
        (op.type === "paint" || op.type === "erase") &&
        op.cells.length > MAX_CELLS_PER_OP
    ) {
        return {
            ok: false,
            errors: [
                createIssue(Code.OP_TOO_LARGE, op.layer, Messages.opTooLarge),
            ],
        };
    }

    const result = applyOp(model.layout, op, toLayoutLibrary(model.library, model.usedTilesets));
    if (result.errors.length > 0) return { ok: false, errors: result.errors };
    return { ok: true, layout: result.layout };
};
