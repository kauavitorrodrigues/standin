import type { EditorOp, EmbeddedWebsiteParams } from "@standin/contracts";

// One set_behavior: the object takes these params in place of the ones it had.
// Null clears them.
export const buildBehaviorOps = (
    id: string,
    params: EmbeddedWebsiteParams | null
): EditorOp[] => [{ type: "set_behavior", id, params }];
