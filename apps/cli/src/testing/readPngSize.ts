import type { PngSize } from "../types";

// The width and height are the first two numbers of the IHDR chunk, after the
// 8 byte signature and the 8 byte chunk header.
const WIDTH_OFFSET: number = 16;
const HEIGHT_OFFSET: number = 20;

export const readPngSize = (bytes: Uint8Array): PngSize => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.length);
    return {
        width: view.getUint32(WIDTH_OFFSET),
        height: view.getUint32(HEIGHT_OFFSET),
    };
};
