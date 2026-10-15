import type { EditorOp } from "@standin/contracts";

// What is kept in IndexedDB for a (userId, mapId, mode) triple.
export type StoredDraft = {
    baseVersion: number;
    // The objects revision the draft started from. Only the decorator uses it.
    baseObjectsRevision?: string | null;
    ops: EditorOp[];
    // The Studio opened over the decorator, so the draft waits for a resume.
    paused?: boolean;
};
