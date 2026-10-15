import type { EditorModel } from "@standin/contracts";

// A point of the world to test, against the draft as it is now.
export type SelectionHitQuery = {
    model: Readonly<EditorModel>;
    worldX: number;
    worldY: number;
};
