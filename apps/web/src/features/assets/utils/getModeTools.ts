import { EDITOR_MODES, type EditorMode } from "../consts/editorModes";
import { SPRITE_TOOLS, type SpriteTool } from "../consts/spriteTools";

// The tools of a layer. The brush of the footprint paints its tiles, so it
// only exists where the footprint has more than one tile.
export const getModeTools = (
    mode: EditorMode,
    canPaintTiles: boolean
): SpriteTool[] => {
    switch (mode) {
        case EDITOR_MODES.COLLISION:
            return [
                SPRITE_TOOLS.BRUSH,
                SPRITE_TOOLS.RECT,
                SPRITE_TOOLS.BUCKET,
                SPRITE_TOOLS.ERASE,
            ];
        case EDITOR_MODES.FOOTPRINT:
            if (canPaintTiles) {
                return [
                    SPRITE_TOOLS.RECT,
                    SPRITE_TOOLS.BRUSH,
                    SPRITE_TOOLS.ERASE,
                ];
            }
            return [SPRITE_TOOLS.RECT, SPRITE_TOOLS.ERASE];
        default:
            return [SPRITE_TOOLS.RECT, SPRITE_TOOLS.ERASE];
    }
};

// The tool chosen, or the first one of the layer when the layer does not have
// it, like after switching from the bucket of the collision to the footprint.
export const getEffectiveTool = (
    mode: EditorMode,
    chosenTool: SpriteTool,
    canPaintTiles: boolean
): SpriteTool => {
    const tools = getModeTools(mode, canPaintTiles);
    if (tools.includes(chosenTool)) return chosenTool;
    return tools[0];
};
