import type { EditorModel, EditorOp } from "@standin/contracts";
import type { DraftChange } from "@/features/maps/__shared__/types/draft-change";
import type { HistoryEntry } from "@/features/maps/__shared__/types/HistoryEntry";

export type DraftState = {
    // What is published, read when the editor opens.
    base: EditorModel;
    // The base with the effective operations applied.
    draft: EditorModel;
    // The effective operations, in order.
    ops: EditorOp[];
    undo: HistoryEntry[];
    redo: HistoryEntry[];
    // What produced this state.
    change: DraftChange;
};
