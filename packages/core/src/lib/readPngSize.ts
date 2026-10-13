import {
    PNG_HEADER_CHUNK_TYPE,
    PNG_HEADER_CHUNK_TYPE_OFFSET,
    PNG_HEADER_MIN_LENGTH,
    PNG_HEIGHT_OFFSET,
    PNG_SIGNATURE_BYTES,
    PNG_WIDTH_OFFSET,
} from "./consts/png";
import { ASCII_ENCODING } from "./consts/encoding";
import type { ImageSize } from "./types";

/**
 * Width and height from the IHDR chunk of a PNG, or null if it isn't one. The
 * check is the 8 byte signature and the IHDR chunk type, not the file name or
 * the declared mime type.
 */
export const readPngSize = (buffer: Buffer): ImageSize | null => {
    if (buffer.length < PNG_HEADER_MIN_LENGTH) return null;
    if (!PNG_SIGNATURE_BYTES.every((byte, index) => buffer[index] === byte)) {
        return null;
    }
    const chunkType = buffer
        .subarray(
            PNG_HEADER_CHUNK_TYPE_OFFSET,
            PNG_HEADER_CHUNK_TYPE_OFFSET + PNG_HEADER_CHUNK_TYPE.length
        )
        .toString(ASCII_ENCODING);
    if (chunkType !== PNG_HEADER_CHUNK_TYPE) return null;

    return {
        width: buffer.readUInt32BE(PNG_WIDTH_OFFSET),
        height: buffer.readUInt32BE(PNG_HEIGHT_OFFSET),
    };
};
