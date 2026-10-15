import type { EditorOp, EditScopeKind } from "@standin/contracts";

// One publish request as it was first built. A repeat sends the same
// publishId, so the server can answer with the result it already stored.
// Without a scope it is the one of the Studio, the whole map. The decorator
// sends `objects` and the objects revision its draft started from.
export type PublishAttempt = {
    publishId: string;
    baseVersion: number;
    ops: EditorOp[];
    scope?: EditScopeKind;
    baseObjectsRevision?: string | null;
};
