import type { EditorOp } from "@standin/contracts";

// What is kept in IndexedDB for a (userId, mapId) pair.
export type StoredDraft = {
    baseVersion: number;
    ops: EditorOp[];
};
