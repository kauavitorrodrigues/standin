import type { EditorOp } from "@standin/contracts";

// One publish request as it was first built. A repeat sends the same
// publishId, so the server can answer with the result it already stored.
export type PublishAttempt = {
    publishId: string;
    baseVersion: number;
    ops: EditorOp[];
};
