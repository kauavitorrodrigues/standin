import { useDefaultLayout } from "react-resizable-panels";
import {
    EDITOR_PANEL_ID,
    PROPERTIES_PANEL_ID,
    TILE_EDITOR_LAYOUT_ID,
} from "../../consts/propertiesPanel";

// The sizes the panels were left at, kept in the browser (localStorage), so the
// editor opens the way it was last used.
export const useTileEditorLayout = () =>
    useDefaultLayout({
        id: TILE_EDITOR_LAYOUT_ID,
        panelIds: [PROPERTIES_PANEL_ID, EDITOR_PANEL_ID],
        storage: localStorage,
    });
