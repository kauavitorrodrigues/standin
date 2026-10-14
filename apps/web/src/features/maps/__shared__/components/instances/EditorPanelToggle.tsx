import { PanelOpener } from "@/components/editor/PanelOpener";
import { MAP_EDITOR_KEYS } from "@/features/maps/__shared__/consts/editorKeys";
import { useEditorSelector } from "@/features/maps/__shared__/hooks/useEditorSelector";
import { useEditorStore } from "@/features/maps/__shared__/hooks/useEditorStore";

// The button that opens the side panel of the map editor. It shows only while
// the panel is closed.
export const EditorPanelToggle = () => {
    const store = useEditorStore();
    const open = useEditorSelector((state) => state.panelOpen);

    return (
        <PanelOpener
            label="Painel de objetos e tiles"
            shortcut={MAP_EDITOR_KEYS.TOGGLE_PANEL[0].toUpperCase()}
            open={open}
            onToggle={store.togglePanel}
        />
    );
};
