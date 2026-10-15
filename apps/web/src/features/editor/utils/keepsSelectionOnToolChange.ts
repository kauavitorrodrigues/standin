import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import type { EditorTool } from "@/features/editor/types/tool";

// Pan and select work with the selection on the map. The tools that edit
// tiles or zones drop it, so it does not stay marked while they work.
export const keepsSelectionOnToolChange = (tool: EditorTool): boolean => {
    switch (tool) {
        case EDITOR_TOOLS.PAN:
        case EDITOR_TOOLS.SELECT:
            return true;
        default:
            return false;
    }
};
