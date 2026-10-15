import { useHotkey } from "@/hooks/useHotkey";
import { useHotkeyMap } from "@/hooks/useHotkeyMap";
import {
    MAP_EDITOR_COMBOS,
    MAP_EDITOR_KEYS,
    MAP_TOOL_KEYS,
} from "@/features/editor/consts/editorKeys";
import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { useEditorStore } from "@/features/editor/hooks/useEditorStore";
import { useEditorZoom } from "@/features/editor/hooks/useEditorZoom";
import type { ArrowDirection } from "@/features/editor/types/arrow-direction";
import { isEditable } from "@/features/editor/utils/isEditable";

// The keys of the editor. The tool keys, the panel, the grid, the zones, the zoom and the undo and redo combos work
// now. The rest call actions of the store that the tools fill in later. Keys
// are ignored while the user types in a field (the hooks check it).
export const useEditorHotkeys = (onFit: () => void) => {
    const store = useEditorStore();
    const zoom = useEditorZoom();
    const draftStore = useDraftStore();

    // Edits do nothing once the lock is lost or while a publish runs.
    const whenEditable = (action: () => void) => () => {
        if (isEditable(store.getState())) action();
    };

    const undo = whenEditable(() => draftStore.undo());
    const redo = whenEditable(() => draftStore.redo());
    const copy = whenEditable(store.copySelection);
    const paste = whenEditable(store.pasteSelection);
    const rotate = whenEditable(store.rotateSelection);
    const remove = whenEditable(store.removeSelection);
    const move = (direction: ArrowDirection) =>
        whenEditable(() => store.moveSelection(direction));

    useHotkeyMap({
        [MAP_EDITOR_COMBOS.UNDO]: undo,
        [MAP_EDITOR_COMBOS.REDO]: redo,
        [MAP_EDITOR_COMBOS.REDO_ALT]: redo,
        [MAP_EDITOR_COMBOS.PUBLISH]: store.requestPublish,
        [MAP_EDITOR_COMBOS.COPY]: copy,
        [MAP_EDITOR_COMBOS.PASTE]: paste,
    });

    useHotkey(MAP_TOOL_KEYS[EDITOR_TOOLS.PAN], () =>
        store.setTool(EDITOR_TOOLS.PAN)
    );
    useHotkey(MAP_TOOL_KEYS[EDITOR_TOOLS.SELECT], () =>
        store.setTool(EDITOR_TOOLS.SELECT)
    );
    useHotkey(MAP_TOOL_KEYS[EDITOR_TOOLS.PAINT], () =>
        store.setTool(EDITOR_TOOLS.PAINT)
    );
    useHotkey(MAP_TOOL_KEYS[EDITOR_TOOLS.ERASE], () =>
        store.setTool(EDITOR_TOOLS.ERASE)
    );
    useHotkey(MAP_TOOL_KEYS[EDITOR_TOOLS.RECT], () =>
        store.setTool(EDITOR_TOOLS.RECT)
    );
    useHotkey(MAP_TOOL_KEYS[EDITOR_TOOLS.BUCKET], () =>
        store.setTool(EDITOR_TOOLS.BUCKET)
    );
    useHotkey(MAP_TOOL_KEYS[EDITOR_TOOLS.PICKER], () =>
        store.setTool(EDITOR_TOOLS.PICKER)
    );
    useHotkey(MAP_TOOL_KEYS[EDITOR_TOOLS.ZONE], () =>
        store.setTool(EDITOR_TOOLS.ZONE)
    );

    useHotkey(MAP_EDITOR_KEYS.TOGGLE_PANEL, store.togglePanel);
    useHotkey(MAP_EDITOR_KEYS.TOGGLE_GRID, store.toggleGrid);
    useHotkey(MAP_EDITOR_KEYS.TOGGLE_ZONES, store.toggleZones);
    useHotkey(MAP_EDITOR_KEYS.ZOOM_IN, zoom.zoomIn);
    useHotkey(MAP_EDITOR_KEYS.ZOOM_OUT, zoom.zoomOut);
    useHotkey(MAP_EDITOR_KEYS.FIT, onFit);
    useHotkey(MAP_EDITOR_KEYS.ROTATE, rotate);
    useHotkey(MAP_EDITOR_KEYS.DELETE, remove);
    useHotkey(MAP_EDITOR_KEYS.ESCAPE, store.clearSelectionAndPlacing);
    useHotkey(MAP_EDITOR_KEYS.MOVE_UP, move("up"));
    useHotkey(MAP_EDITOR_KEYS.MOVE_DOWN, move("down"));
    useHotkey(MAP_EDITOR_KEYS.MOVE_LEFT, move("left"));
    useHotkey(MAP_EDITOR_KEYS.MOVE_RIGHT, move("right"));
};
