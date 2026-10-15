import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { EDITOR_DIALOG } from "@/features/editor/consts/editor-dialog";

// The back button: leaves right away when nothing changed, otherwise asks
// what to do with the changes.
export const useRequestExit = (onExit: () => void) => {
    const store = useEditorStore();

    return () => {
        if (!store.getState().draft.hasChanges) {
            onExit();
            return;
        }
        store.openDialog(EDITOR_DIALOG.EXIT);
    };
};
