import { useHotkey } from "@/hooks/useHotkey";
import { SPRITE_TOOL_KEYS } from "../consts/spriteEditorKeys";
import { SPRITE_TOOLS, type SpriteTool } from "../consts/spriteTools";

type Params = {
    // The tools the layer being edited has. A key of any other tool does
    // nothing, like its button in the toolbar.
    available: SpriteTool[];
    onTool: (tool: SpriteTool) => void;
};

// The keys of the asset editor: R, P, G and E switch the tool.
export const useSpriteHotkeys = ({ available, onTool }: Params) => {
    const pick = (tool: SpriteTool) => () => {
        if (available.includes(tool)) onTool(tool);
    };

    useHotkey(SPRITE_TOOL_KEYS[SPRITE_TOOLS.RECT], pick(SPRITE_TOOLS.RECT));
    useHotkey(SPRITE_TOOL_KEYS[SPRITE_TOOLS.BRUSH], pick(SPRITE_TOOLS.BRUSH));
    useHotkey(SPRITE_TOOL_KEYS[SPRITE_TOOLS.BUCKET], pick(SPRITE_TOOLS.BUCKET));
    useHotkey(SPRITE_TOOL_KEYS[SPRITE_TOOLS.ERASE], pick(SPRITE_TOOLS.ERASE));
};
