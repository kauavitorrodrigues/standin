import { useCallback } from "react";
import { useDiscardDraft } from "@/features/maps/__shared__/hooks/useDiscardDraft";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { useLockControl } from "@/features/maps/__shared__/hooks/useLockControl";
import { runWithoutLock } from "@/features/maps/__shared__/utils/runWithoutLock";

// Gives `runWithoutLock` the pieces of the open editor: the draft, the lock.
export const useRunWithoutLock = () => {
    const store = useEditorStore();
    const control = useLockControl();
    const discard = useDiscardDraft();

    return useCallback(
        (action: () => Promise<void>) =>
            runWithoutLock({
                hasChanges: store.getState().draft.hasChanges,
                discard,
                control,
                action,
            }),
        [store, control, discard]
    );
};
