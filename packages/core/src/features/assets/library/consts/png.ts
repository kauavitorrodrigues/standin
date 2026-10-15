// What a PNG file is made of, for the encoder.
export const PNG_SIGNATURE = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
export const PNG_BIT_DEPTH = 8;
export const PNG_COLOR_TYPE_RGBA = 6;
export const PNG_FILTER_NONE = 0;
export const PNG_HEADER_LENGTH = 13;
export const PNG_CHANNELS = 4;

export const CHUNK_TYPES = {
    HEADER: "IHDR",
    DATA: "IDAT",
    END: "IEND",
} as const;

// CRC-32 as PNG defines it.
export const CRC_POLYNOMIAL = 0xedb88320;
export const CRC_INITIAL = 0xffffffff;
export const CRC_TABLE_SIZE = 256;
export const BITS_PER_BYTE = 8;

// Flat color tiles get a slightly darker border so tiles can be told apart.
export const TILE_BORDER_SHADE = 12;
