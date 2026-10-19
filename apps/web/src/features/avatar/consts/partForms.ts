import type { CreateBaseFormValues } from "../types/parts";

export const CREATE_BASE_DEFAULTS: CreateBaseFormValues = {
    name: "",
    isDefault: false,
    image: [],
    preview: [],
};

// The sheets are PNGs of exactly one size, so the first bytes are enough to
// tell the file apart and to read its size and color type.
export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Layout of the IHDR chunk, counted from the start of the file.
export const PNG_HEADER = {
    LENGTH: 26,
    WIDTH_OFFSET: 16,
    HEIGHT_OFFSET: 20,
    BIT_DEPTH_OFFSET: 24,
    COLOR_TYPE_OFFSET: 25,
    RGBA_COLOR_TYPE: 6,
    EIGHT_BITS: 8,
} as const;
