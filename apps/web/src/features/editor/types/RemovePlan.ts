import type { EditorOp } from "@standin/contracts";

// The operations that remove objects, and the ids of the claimed desks among
// them, which must wait for the confirmation of the owner's release.
export type RemovePlan = {
    ops: EditorOp[];
    claimedIds: string[];
};
