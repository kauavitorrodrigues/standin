import type { EditorModel, EditorOp } from "@standin/contracts";
import type { DraftGestureResult } from "@/features/maps/__shared__/types/DraftGestureResult";

// What the actions of the store (move, remove) need from the draft. The
// provider of the DraftStore attaches it, so the store never imports it.
export type SelectionHost = {
    getModel: () => Readonly<EditorModel>;
    dispatch: (ops: readonly EditorOp[]) => DraftGestureResult;
};
