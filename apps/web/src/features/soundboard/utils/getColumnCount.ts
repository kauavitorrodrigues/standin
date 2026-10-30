import {
    SOUNDBOARD_GRID_GAP_PX,
    SOUNDBOARD_MAX_COLUMNS,
    SOUNDBOARD_MIN_COLUMNS,
    SOUNDBOARD_MIN_TILE_WIDTH_PX,
} from "../consts/grid";

/**
 * How many tiles go in a line of a card this wide: as many as keep each tile
 * at least the minimum width, from the minimum up to the maximum of columns.
 */
export const getColumnCount = (widthPx: number): number => {
    for (
        let columns = SOUNDBOARD_MAX_COLUMNS;
        columns > SOUNDBOARD_MIN_COLUMNS;
        columns--
    ) {
        const needed =
            columns * SOUNDBOARD_MIN_TILE_WIDTH_PX +
            (columns - 1) * SOUNDBOARD_GRID_GAP_PX;
        if (widthPx >= needed) return columns;
    }
    return SOUNDBOARD_MIN_COLUMNS;
};
