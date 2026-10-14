import { applyEditorOp } from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import type { ApplyEditorOpsResult } from "@/features/maps/__shared__/types/ApplyEditorOpsResult";

// Applies the operations one after the other. Any failure discards the lot, so
// the caller never sees a half applied gesture.
export const applyEditorOps = (
    model: EditorModel,
    ops: readonly EditorOp[]
): ApplyEditorOpsResult => {
    let current = model;
    const inverseBySteps: EditorOp[][] = [];

    for (const op of ops) {
        const result = applyEditorOp(current, op);
        if (!result.ok) return { ok: false, errors: result.errors };
        current = result.model;
        inverseBySteps.push(result.inverse);
    }

    return {
        ok: true,
        model: current,
        inverse: inverseBySteps.reverse().flat(),
    };
};
