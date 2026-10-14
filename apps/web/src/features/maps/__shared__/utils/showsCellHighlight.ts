import { EDITOR_TOOLS } from "@/features/maps/__shared__/consts/tools";
import type { EditorTool } from "@/features/maps/__shared__/types/tool";

// Whether the square over the cell under the cursor shows for the tool. The
// select tool works on whole objects, so a tile square would only get in the
// way of their contour and their box.
export const showsCellHighlight = (tool: EditorTool): boolean => {
    switch (tool) {
        case EDITOR_TOOLS.SELECT:
        case EDITOR_TOOLS.PAN:
            return false;
        default:
            return true;
    }
};
