import type { EditorOp } from "@standin/contracts";

// The same operations in the same order. Operations are never edited in
// place, so comparing each one by reference is enough.
export const isSameOps = (
    a: readonly EditorOp[],
    b: readonly EditorOp[]
): boolean => a.length === b.length && a.every((op, index) => op === b[index]);
