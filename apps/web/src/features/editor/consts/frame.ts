// The frame of an area over the canvas. The dim covers what is outside it, the
// marks over objects the edge cuts sit above the dim, and the border and the
// handles sit above everything but the zones.
export const EDITOR_FRAME = {
    DIM_DEPTH: 190000,
    MARK_DEPTH: 190001,
    BORDER_DEPTH: 190002,
    DIM_COLOR: 0x0f172a,
    DIM_ALPHA: 0.55,
    BORDER_COLOR: 0xfacc15,
    BORDER_WIDTH: 3,
    CUT_COLOR: 0xef4444,
    CUT_FILL_ALPHA: 0.35,
    CUT_LINE_WIDTH: 2,
    HANDLE_SIZE: 10,
    HANDLE_FILL: 0xffffff,
    HANDLE_STROKE: 0x0f172a,
    HANDLE_STROKE_WIDTH: 2,
    // How close to an edge or a corner a press must land, in screen px, so the
    // reach does not shrink with the zoom.
    EDGE_REACH: 6,
    CORNER_REACH: 10,
    GRIP_SIZE: 16,
    GRIP_INSET: 4,
} as const;

export const FRAME_CURSORS = {
    DEFAULT: "default",
    MOVE: "move",
    NORTH_SOUTH: "ns-resize",
    EAST_WEST: "ew-resize",
    NORTH_WEST_SOUTH_EAST: "nwse-resize",
    NORTH_EAST_SOUTH_WEST: "nesw-resize",
} as const;
