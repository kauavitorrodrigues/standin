import { useState } from "react";
import { useHotkey } from "@/hooks/useHotkey";
import { TILE_EDITOR_KEYS } from "../../consts/editorKeys";

// The side panel of the editor (the grid and the info of the tileset). It
// floats over the sheet, so it can be closed to give the sheet all the area.
// The key toggles it.
export const usePropertiesPanel = (enabled: boolean) => {
    const [open, setOpen] = useState(true);
    const toggle = () => setOpen((current) => !current);

    useHotkey(TILE_EDITOR_KEYS.TOGGLE_PROPERTIES, toggle, { enabled });

    return { propertiesOpen: open, toggleProperties: toggle };
};
