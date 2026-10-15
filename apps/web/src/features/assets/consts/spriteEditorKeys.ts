import { SPRITE_TOOLS, type SpriteTool } from "./spriteTools";

// The keys of the tools, matched against `event.key` in lower case. They are
// the same as the ones for the same tools in the map editor and the tile
// editor.
export const SPRITE_TOOL_KEYS: Readonly<Record<SpriteTool, readonly string[]>> =
    {
        [SPRITE_TOOLS.RECT]: ["r"],
        [SPRITE_TOOLS.BRUSH]: ["p"],
        [SPRITE_TOOLS.BUCKET]: ["g"],
        [SPRITE_TOOLS.ERASE]: ["e"],
    };
