import { EDITOR_TOOLS } from "@/features/maps/__shared__/consts/tools";
import type { EditorTool } from "@/features/maps/__shared__/types/tool";

type Params = {
    spaceHeld: boolean;
    tool: EditorTool;
};

// The view moves with a left drag: space held or the pan tool.
export const isPanMode = ({ spaceHeld, tool }: Params): boolean =>
    spaceHeld || tool === EDITOR_TOOLS.PAN;
