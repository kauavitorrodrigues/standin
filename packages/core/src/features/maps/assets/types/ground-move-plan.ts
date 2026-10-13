import type { RowChange } from "./row-change";

// The parent the object ends up with and the rows that change besides it.
export type GroundMovePlan = {
    parentId: string | null;
    childChanges: RowChange[];
};
