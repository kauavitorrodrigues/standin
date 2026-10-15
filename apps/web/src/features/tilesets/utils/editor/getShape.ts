import type { TileShapeTool } from "../../types/sheet";
import { getTileLine } from "./getLine";
import { getTileRect } from "./getAt";

// The tiles a drag from one tile to another draws with a shape tool.
export const getTileShape = (
    tool: TileShapeTool,
    from: number,
    to: number,
    columns: number
): number[] => {
    switch (tool) {
        case "line":
            return getTileLine(from, to, columns);
        case "rect":
            return getTileRect(from, to, columns);
    }
};
