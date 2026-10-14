export const EDITOR_CAMERA_CONFIG = {
    // Zoom the store starts with, before the scene fits the map (scale factor).
    DEFAULT_ZOOM: 2,
    // Room the camera allows around the map (tiles).
    BOUNDS_MARGIN_TILES: 2,
} as const;

export const EDITOR_ZOOM_DIRECTIONS = {
    IN: 1,
    OUT: -1,
    NEUTRAL: 0,
} as const;

export type EditorZoomDirection =
    (typeof EDITOR_ZOOM_DIRECTIONS)[keyof typeof EDITOR_ZOOM_DIRECTIONS];

export const EDITOR_POINTER_BUTTONS = {
    MIDDLE: 1,
} as const;

export const EDITOR_CURSORS = {
    IDLE: "default",
    PAN: "grab",
    PANNING: "grabbing",
} as const;
