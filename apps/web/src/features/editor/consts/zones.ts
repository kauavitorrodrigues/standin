// Zone outlines and labels draw over everything but the grid tools.
export const EDITOR_ZONES = {
    DEPTH: 200000,
    OUTLINE_WIDTH: 2,
    OUTLINE_ALPHA: 0.9,
    FILL_ALPHA: 0.08,
    AREA_COLOR: 0x38bdf8,
    SPAWN_COLOR: 0x4ade80,
    SPAWN_RADIUS: 8,
    SPAWN_STROKE_COLOR: 0x000000,
    SPAWN_STROKE_WIDTH: 2,
    LABEL_OFFSET: 2,
    LABEL_STYLE: {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: "#ffffff",
        backgroundColor: "#00000099",
        padding: { x: 3, y: 1 },
    },
} as const;
