import {
    SOUNDBOARD_HEADER_ROW_HEIGHT_PX,
    SOUNDBOARD_PANEL_STATE_ROW_HEIGHT_PX,
    SOUNDBOARD_STATE_ROW_HEIGHT_PX,
    SOUNDBOARD_TILE_ROW_HEIGHT_PX,
} from "../consts/grid";
import type { ClipRow } from "../types/row";
import { isRowCollapsed } from "./isRowCollapsed";

/**
 * How tall a row is. A line of tiles is as tall as the way the clips are shown
 * makes it, the panel's by default.
 */
export const getRowHeight = (
    row: ClipRow | undefined,
    tilesRowHeight: number = SOUNDBOARD_TILE_ROW_HEIGHT_PX
): number => {
    if (row === undefined) return SOUNDBOARD_STATE_ROW_HEIGHT_PX;
    // A folded row stays in the list at no height, so folding moves what is
    // below it instead of dropping the row.
    if (isRowCollapsed(row)) return 0;
    switch (row.kind) {
        case "header":
            return SOUNDBOARD_HEADER_ROW_HEIGHT_PX;
        case "tiles":
            return tilesRowHeight;
        case "state":
            return SOUNDBOARD_STATE_ROW_HEIGHT_PX;
        case "panel":
            return SOUNDBOARD_PANEL_STATE_ROW_HEIGHT_PX;
    }
};
