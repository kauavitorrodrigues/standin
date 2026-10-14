import type { EditorOp, TileConflict } from "@standin/contracts";

// What a tile gesture sends: the operations (in blocks of at most
// MAX_CELLS_PER_OP cells) and the cells it left out because of a conflict.
export type TileGestureOps = {
    ops: EditorOp[];
    conflicts: TileConflict[];
};
