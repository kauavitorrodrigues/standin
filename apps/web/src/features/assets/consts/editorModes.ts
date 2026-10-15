export const EDITOR_MODES = {
    CROP: "crop",
    FOOTPRINT: "footprint",
} as const;

export type EditorMode = (typeof EDITOR_MODES)[keyof typeof EDITOR_MODES];
