import type { TileShapeTool, TileTool } from "../../types/sheet";

// The tools that put the brush on the sheet, so the brush has to be in sight.
export const usesBrush = (tool: TileTool): boolean => {
    switch (tool) {
        case "paint":
        case "line":
        case "rect":
        case "bucket":
            return true;
        default:
            return false;
    }
};

export const isShapeTool = (tool: TileTool): tool is TileShapeTool => {
    switch (tool) {
        case "line":
        case "rect":
            return true;
        default:
            return false;
    }
};
