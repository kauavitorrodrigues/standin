// The stage renders at most 2 videos at a time and pages through the rest.
// Change this one value to try 4 to 6.
export const CAROUSEL_SIZE = 2;

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

// At most 2 pinned videos are kept, FIFO by pinnedAt. The cap of 1 with a pinned embedded
// website waits for embeds.
export const MAX_PINNED_VIDEOS = 2;
