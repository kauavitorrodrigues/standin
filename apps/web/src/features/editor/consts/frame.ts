// The frame of an area over the canvas. The dim covers what is outside it, the
// marks over objects the edge cuts sit above the dim, and the border and the
// handles sit above everything but the zones.
export const EDITOR_FRAME = {
    DIM_DEPTH: 190000,
    MARK_DEPTH: 190001,
    BORDER_DEPTH: 190002,
    DIM_COLOR: 0x000000,
    DIM_ALPHA: 0.45,
    // A faint lift over the inside of the frame, so it reads against the dim.
    INSIDE_COLOR: 0xffffff,
    INSIDE_ALPHA: 0.04,
    BORDER_COLOR: 0xffffff,
    BORDER_ALPHA: 0.85,
    BORDER_WIDTH: 1.5,
    CUT_COLOR: 0xef4444,
    CUT_FILL_ALPHA: 0.35,
    CUT_LINE_WIDTH: 2,
    // Handle and border sizes in screen px, drawn against the camera zoom.
    HANDLE_RADIUS: 5,
    HANDLE_FILL: 0xffffff,
    HANDLE_STROKE: 0x0f172a,
    HANDLE_STROKE_WIDTH: 1.5,
    // How close to an edge or a corner a press must land, in screen px, so the
    // reach does not shrink with the zoom.
    EDGE_REACH: 6,
    CORNER_REACH: 10,
} as const;

// Screen px kept free around the frame when the view fits it: room beside and above the frame. The panels are not under the canvas, so they
// need no room here.
export const FRAME_FIT_PADDING = { x: 48, y: 110 } as const;

// The reference avatar beside the frame, the size the player has in the game, so
// the area can be judged against something real. It is not part of the area.
export const FRAME_AVATAR = {
    GAP: 14,
    LABEL: "Avatar",
    LABEL_COLOR: "#a3a3a3",
    LABEL_SIZE: "10px",
    LABEL_FONT: "Inter, system-ui, sans-serif",
    // The text is drawn at this many times its size, so it stays sharp when the
    // camera zooms in.
    LABEL_RESOLUTION: 4,
    LABEL_GAP: 4,
    ALPHA: 0.9,
} as const;

export const FRAME_CURSORS = {
    DEFAULT: "default",
    MOVE: "move",
    NORTH_SOUTH: "ns-resize",
    EAST_WEST: "ew-resize",
    NORTH_WEST_SOUTH_EAST: "nwse-resize",
    NORTH_EAST_SOUTH_WEST: "nesw-resize",
} as const;

// Room the camera allows around the canvas of an area (tiles), enough to center
// a frame that sits in a corner.
export const FRAME_CAMERA_MARGIN_TILES = 40;
