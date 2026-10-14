import { EDITOR_POINTER_BUTTONS } from "@/features/maps/__shared__/consts/camera";
import { isPanMode } from "@/features/maps/__shared__/utils/isPanMode";
import type { EditorTool } from "@/features/maps/__shared__/types/tool";

type Params = {
    button: number;
    leftDown: boolean;
    spaceHeld: boolean;
    tool: EditorTool;
};

// The one rule for a press that moves the view instead of drawing: the middle
// button, or the left one with space held or the pan tool.
export const isPanPointer = ({
    button,
    leftDown,
    spaceHeld,
    tool,
}: Params): boolean => {
    if (button === EDITOR_POINTER_BUTTONS.MIDDLE) return true;
    return leftDown && isPanMode({ spaceHeld, tool });
};
