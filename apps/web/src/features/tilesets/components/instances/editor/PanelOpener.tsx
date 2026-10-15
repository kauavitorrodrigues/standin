import { PanelOpener } from "@/features/editor/components/views/PanelOpener";
import { TILE_EDITOR_KEYS } from "../../../consts/editorKeys";
import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";

// The button that opens the side panel, while it is closed.
export const TileEditorPanelOpener = () => {
    const { propertiesOpen, toggleProperties } = useTileEditorContext();

    return (
        <PanelOpener
            label="Painel do tileset"
            shortcut={TILE_EDITOR_KEYS.TOGGLE_PROPERTIES[0].toUpperCase()}
            open={propertiesOpen}
            onToggle={toggleProperties}
        />
    );
};
