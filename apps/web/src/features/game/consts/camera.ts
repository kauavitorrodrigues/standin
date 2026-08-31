export const MAP_CAMERA_CONFIG = {
    DEFAULT_ZOOM: 2,
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 3,
    ZOOM_STEP: 0.5,
    ZOOM_TWEEN_DURATION_MS: 150,
    FOLLOW_ROUND_PIXELS: true,
    FOLLOW_LERP: 0.15,
    NO_VERTICAL_FOLLOW_OFFSET: 0,
    NO_HORIZONTAL_FOLLOW_OFFSET: 0,
    NO_ZOOM_DELTA: 0,
} as const;

export const WHEEL_ZOOM_DIRECTIONS = {
    IN: -1,
    OUT: 1,
    NEUTRAL: 0,
} as const;

export type WheelZoomDirection =
    (typeof WHEEL_ZOOM_DIRECTIONS)[keyof typeof WHEEL_ZOOM_DIRECTIONS];

export const MAP_DRAG_CURSORS = {
    IDLE: "grab",
    DRAGGING: "grabbing",
} as const;

export const CAMERA_EVENTS = {
    STATE_CHANGED: "camera:state-changed",
} as const;
