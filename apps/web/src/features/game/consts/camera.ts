export const MAP_CAMERA_CONFIG = {
    DEFAULT_ZOOM: 2,
    MIN_ZOOM: 0.5,
    MAX_ZOOM: 4,
    ZOOM_STEP: 1,
    ZOOM_TWEEN_DURATION_MS: 100,
    // Off on purpose: Phaser would floor the scroll to whole world px, which
    // shakes the avatar at a high zoom. The controller snaps the scroll to whole
    // screen px instead (see `MapCameraController`).
    FOLLOW_ROUND_PIXELS: false,
    // 1 locks the view to the avatar. A lower value makes the camera trail the
    // avatar, and with pixel rounding on both the sprite and the scroll land on
    // different pixels from frame to frame, which shows up as jitter.
    FOLLOW_LERP: 1,
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

// The cursor is the normal arrow everywhere on the map, also while the camera
// is dragged. Only a target (a desk, an avatar) turns it into a pointer.
export const MAP_CURSORS = {
    IDLE: "default",
} as const;

// How far the pointer has to move with the button down before it is a drag.
// Under it the press is a click, so a click on a desk is not read as a pan.
export const MAP_DRAG_THRESHOLD_PX = 4;

export const CAMERA_EVENTS = {
    STATE_CHANGED: "camera:state-changed",
} as const;
