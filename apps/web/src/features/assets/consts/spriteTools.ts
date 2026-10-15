// What a drag over the image does inside the layer being edited.
export const SPRITE_TOOLS = {
    RECT: "rect",
    BRUSH: "brush",
    BUCKET: "bucket",
    ERASE: "erase",
} as const;

export type SpriteTool = (typeof SPRITE_TOOLS)[keyof typeof SPRITE_TOOLS];
