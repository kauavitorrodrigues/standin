import { EDITOR_POINTER_BUTTONS } from "@/features/editor/consts/camera";
import { isPanMode } from "@/features/editor/utils/isPanMode";
import type { EditorTool } from "@/features/editor/types/tool";

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
