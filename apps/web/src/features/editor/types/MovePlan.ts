import type { EditorOp, LayoutIssueCode } from "@standin/contracts";

// Where a move would land and whether the model accepts it.
export type MovePlan = {
    op: Extract<EditorOp, { type: "move_asset" }>;
    tileX: number;
    tileY: number;
    // The pixel shift the object keeps, a drag by cells does not change it.
    offsetX: number;
    offsetY: number;
    parentId: string | null;
    reason: LayoutIssueCode | null;
};
