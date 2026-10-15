import { PanelOpener } from "@/components/editor/PanelOpener";
import { TILE_EDITOR_KEYS } from "../../../consts/editorKeys";
import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { TILE_PANEL_LABEL } from "../../../consts/editorPanel";

// The button that opens the side panel, while it is closed.
export const TileEditorPanelOpener = () => {
    const { propertiesOpen, toggleProperties } = useTileEditorContext();

    return (
        <PanelOpener
            label={TILE_PANEL_LABEL}
            shortcut={TILE_EDITOR_KEYS.TOGGLE_PROPERTIES[0].toUpperCase()}
            open={propertiesOpen}
            onToggle={toggleProperties}
        />
    );
};
