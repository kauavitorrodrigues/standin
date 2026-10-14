import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";
import { EDITOR_DIALOG } from "@/features/maps/__shared__/consts/editor-dialog";

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
