import { PNG } from "pngjs";

export type DecodedPng = {
    width: number;
    height: number;
    // RGBA, 4 bytes per pixel, row by row.
    data: Uint8Array;
};

/**
 * Decodes a PNG into RGBA pixels. It throws when the bytes are corrupt, so
 * callers that take uploads check the header first and wrap the call.
 */
export const decodePng = (buffer: Buffer): DecodedPng => {
    const png = PNG.sync.read(buffer);
    return {
        width: png.width,
        height: png.height,
        data: new Uint8Array(
            png.data.buffer,
            png.data.byteOffset,
            png.data.length
        ),
    };
};
