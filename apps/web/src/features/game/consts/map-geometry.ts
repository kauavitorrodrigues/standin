export const MAP_LAYER_ORIGIN = {
    X: 0,
    Y: 0,
} as const;

export const CENTER_POSITION_DIVISOR = 2;

export const OBJECT_ANCHOR_KINDS = {
    TOP_LEFT: "top-left",
    BOTTOM_LEFT: "bottom-left",
} as const;

export type ObjectAnchorKind =
    (typeof OBJECT_ANCHOR_KINDS)[keyof typeof OBJECT_ANCHOR_KINDS];

export const OBJECT_ANCHOR_VERTICAL_SIGNS = {
    [OBJECT_ANCHOR_KINDS.TOP_LEFT]: 1,
    [OBJECT_ANCHOR_KINDS.BOTTOM_LEFT]: -1,
} as const;
