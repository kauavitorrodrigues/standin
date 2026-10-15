import { useSyncExternalStore } from "react";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import type { DraftState } from "@/features/editor/types/DraftState";

// Reads one piece of the draft. The component renders again only when what the
// selector returns changes, so it must return a value that stays the same
// while the draft does.
export const useDraftSelector = <T>(selector: (state: DraftState) => T): T => {
    const store = useDraftStore();

    return useSyncExternalStore(store.subscribe, () =>
        selector(store.getState())
    );
};
