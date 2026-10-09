export const MAX_VISIBLE_STAGE_TILES = 4;

// Matches the duration of the zoom classes in AllTilesView.
export const STAGE_VIEW_TRANSITION_MS = 200;

export const TILE_GRID_ASPECT_RATIO = 16 / 9;
export const TILE_GRID_GAP_PX = 12;
export const TILE_GRID_WIDTH_TOLERANCE = 0.85;

export const STAGE_VIEWS = {
    OFFICE: "office",
    GRID: "grid",
} as const;

export type StageView = (typeof STAGE_VIEWS)[keyof typeof STAGE_VIEWS];
