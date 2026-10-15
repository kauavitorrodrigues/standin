import { EDITOR_TOOLS } from "@/features/editor/consts/tools";
import type { EditorTool } from "@/features/editor/types/tool";

type Params = {
    spaceHeld: boolean;
    tool: EditorTool;
};

// The view moves with a left drag: space held or the pan tool.
export const isPanMode = ({ spaceHeld, tool }: Params): boolean =>
    spaceHeld || tool === EDITOR_TOOLS.PAN;
