import type { EditorLockControl } from "@/features/maps/__shared__/types/EditorLockControl";

export type RunWithoutLockDeps = {
    hasChanges: boolean;
    // Throws the draft away and clears the saved copy.
    discard: () => Promise<void>;
    control: Pick<EditorLockControl, "release" | "reacquire" | "markLost">;
    // What needs the lock gone (the delete of the map owner).
    action: () => Promise<void>;
};
