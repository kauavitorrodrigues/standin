import { EDITOR_MODES, type EditorMode } from "../consts/editorModes";
import { SPRITE_TOOLS, type SpriteTool } from "../consts/spriteTools";

// The tools of a layer. The footprint of a still piece is painted by cells,
// like the collision, so it has the same tools. The footprint of an animated
// piece is a rectangle, so it only has the rectangle.
export const getModeTools = (
    mode: EditorMode,
    canPaintCells: boolean
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
            if (canPaintCells) {
                return [
                    SPRITE_TOOLS.BRUSH,
                    SPRITE_TOOLS.RECT,
                    SPRITE_TOOLS.BUCKET,
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
    canPaintCells: boolean
): SpriteTool => {
    const tools = getModeTools(mode, canPaintCells);
    if (tools.includes(chosenTool)) return chosenTool;
    return tools[0];
};
