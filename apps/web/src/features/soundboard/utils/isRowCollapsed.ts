import type { ClipRow } from "../types/row";

/** Whether the row belongs to a folded group and so has no height. */
export const isRowCollapsed = (row: ClipRow | undefined): boolean => {
    if (row === undefined) return false;
    switch (row.kind) {
        case "tiles":
        case "state":
            return row.isCollapsed;
        case "header":
        case "panel":
            return false;
    }
};
