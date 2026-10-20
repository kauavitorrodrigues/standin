// Layout of a PNG file: the 8 byte signature, then the IHDR chunk with the size.
export const PNG_SIGNATURE_BYTES = [
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
] as const;
export const PNG_HEADER_CHUNK_TYPE = "IHDR";
export const PNG_HEADER_CHUNK_TYPE_OFFSET = 12;
export const PNG_WIDTH_OFFSET = 16;
export const PNG_HEIGHT_OFFSET = 20;
export const PNG_HEADER_MIN_LENGTH = PNG_HEIGHT_OFFSET + 4;

// Bit depth and color type of the IHDR chunk, right after the size.
export const PNG_BIT_DEPTH_OFFSET = 24;
export const PNG_COLOR_TYPE_OFFSET = 25;
export const PNG_COLOR_TYPE_RGBA = 6;
export const PNG_BIT_DEPTH_8 = 8;
