import type { EditorOp } from "@standin/contracts";

// One gesture in the undo or redo stack. `ops` are the operations as they were
// applied. `inverse` undoes them, already in the order it has to be applied.
export type HistoryEntry = {
    ops: EditorOp[];
    inverse: EditorOp[];
};
