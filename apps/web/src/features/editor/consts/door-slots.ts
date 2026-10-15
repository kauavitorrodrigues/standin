// How the editor helps to place a door: the distance in tiles within which the
// ghost jumps to a gap in a wall, and the marker drawn on every gap.
export const DOOR_SLOT_SNAP = {
    RADIUS_TILES: 4,
} as const;

export const DOOR_SLOT_OVERLAY = {
    DEPTH: 700,
    COLOR: 0x55dd77,
    FILL_ALPHA: 0.12,
    STROKE_ALPHA: 0.85,
    STROKE_WIDTH: 2,
    CORNER_RADIUS: 4,
    INSET: 2,
    PULSE_MIN_ALPHA: 0.45,
    PULSE_MAX_ALPHA: 1,
    PULSE_DURATION_MS: 700,
} as const;
