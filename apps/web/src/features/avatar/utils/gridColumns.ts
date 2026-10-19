import {
    PART_GRID_GAP,
    PART_GRID_MAX_COLUMNS,
    PART_GRID_TILE_SIZE,
} from "../consts/editor/grid";

// How many tiles fit in a row of `width` px, at least one and at most the
// maximum of the grid.
export const getGridColumns = (width: number): number => {
    const fits = Math.floor(
        (width + PART_GRID_GAP) / (PART_GRID_TILE_SIZE + PART_GRID_GAP)
    );
    return Math.min(PART_GRID_MAX_COLUMNS, Math.max(1, fits));
};

// The columns of one row of the grid.
export const getGridTemplate = (columns: number): string =>
    `repeat(${columns}, ${PART_GRID_TILE_SIZE}px)`;
