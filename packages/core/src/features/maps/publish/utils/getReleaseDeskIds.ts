import type { EditorOp } from "@standin/contracts";

// Ids of the objects that a remove_asset op deletes with releaseDesk on.
export const getReleaseDeskIds = (ops: EditorOp[]): string[] => {
    const ids = new Set<string>();
    for (const op of ops) {
        if (op.type !== "remove_asset") continue;
        if (op.releaseDesk === true) ids.add(op.id);
    }
    return [...ids];
};
