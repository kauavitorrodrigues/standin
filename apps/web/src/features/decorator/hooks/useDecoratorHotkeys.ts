import { useHotkey } from "@/hooks/useHotkey";
import { useHotkeyMap } from "@/hooks/useHotkeyMap";
import {
    MAP_EDITOR_COMBOS,
    MAP_EDITOR_KEYS,
} from "@/features/editor/consts/editorKeys";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { isEditable } from "@/features/editor/utils/isEditable";

// The keys of the decorator: undo and redo, copy and paste, turn, delete and
// Esc. The arrows are left out because they walk the avatar, and the tool and
// panel keys of the map editor do not exist here.
export const useDecoratorHotkeys = () => {
    const store = useEditorStore();
    const draftStore = useDraftStore();

    // Edits do nothing once the lock is lost or while the decoration is applied.
    const whenEditable = (action: () => void) => () => {
        if (isEditable(store.getState())) action();
    };

    const undo = whenEditable(() => draftStore.undo());
    const redo = whenEditable(() => draftStore.redo());

    useHotkeyMap({
        [MAP_EDITOR_COMBOS.UNDO]: undo,
        [MAP_EDITOR_COMBOS.REDO]: redo,
        [MAP_EDITOR_COMBOS.REDO_ALT]: redo,
        [MAP_EDITOR_COMBOS.COPY]: whenEditable(store.copySelection),
        [MAP_EDITOR_COMBOS.PASTE]: whenEditable(store.pasteSelection),
    });

    useHotkey(MAP_EDITOR_KEYS.ROTATE, whenEditable(store.rotateSelection));
    useHotkey(MAP_EDITOR_KEYS.DELETE, whenEditable(store.removeSelection));
    useHotkey(MAP_EDITOR_KEYS.ESCAPE, store.clearSelectionAndPlacing);
};
