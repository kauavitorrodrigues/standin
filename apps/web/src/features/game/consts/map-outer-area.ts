export const MAP_OUTER_AREA = {
    // What the view shows past the edge of the map: the muted teal of the Gather
    // reference.
    COLOR: 0x3a5c5f,
    FRAME_COLOR: 0xffffff,
    FRAME_ALPHA: 0.3,
    // In screen px, so the line is as thick at any zoom.
    FRAME_WIDTH_PX: 1,
    // Under every tile and object, so the frame never draws over the map.
    FRAME_DEPTH: -1,
} as const;
