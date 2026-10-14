import { useSyncExternalStore } from "react";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import type { EditorState } from "@/features/editor/types/editor-state";

// Reads one piece of the editor state. The component renders again only when
// what the selector returns changes, so it must return a value that stays the
// same while the state does (a field, not a new object).
export const useEditorSelector = <T>(
    selector: (state: EditorState) => T
): T => {
    const store = useEditorStore();

    return useSyncExternalStore(store.subscribe, () =>
        selector(store.getState())
    );
};
