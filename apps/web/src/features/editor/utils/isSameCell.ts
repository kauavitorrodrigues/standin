import type { Cell } from "@standin/contracts";

/** Whether two cells are the same one. A missing cell is never the same. */
export const isSameCell = (a: Cell | null, b: Cell | null): boolean =>
    a !== null && b !== null && a[0] === b[0] && a[1] === b[1];
