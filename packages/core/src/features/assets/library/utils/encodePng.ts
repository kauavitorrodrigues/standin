import { deflateSync } from "node:zlib";
import {
    CHUNK_TYPES,
    PNG_BIT_DEPTH,
    PNG_CHANNELS,
    PNG_COLOR_TYPE_RGBA,
    PNG_FILTER_NONE,
    PNG_HEADER_LENGTH,
    PNG_SIGNATURE,
} from "../consts/png";
import type { Rgba } from "../types/rgba";
import { buildChunk } from "./buildChunk";

const WIDTH_OFFSET = 0;
const HEIGHT_OFFSET = 4;
const BIT_DEPTH_OFFSET = 8;
const COLOR_TYPE_OFFSET = 9;

/** A PNG from raw RGBA pixels (row major). No dependency, for placeholder art. */
export const encodePng = (
    width: number,
    height: number,
    pixels: Rgba[]
): Buffer => {
    const header = Buffer.alloc(PNG_HEADER_LENGTH);
    header.writeUInt32BE(width, WIDTH_OFFSET);
    header.writeUInt32BE(height, HEIGHT_OFFSET);
    header[BIT_DEPTH_OFFSET] = PNG_BIT_DEPTH;
    header[COLOR_TYPE_OFFSET] = PNG_COLOR_TYPE_RGBA;

    const stride = width * PNG_CHANNELS;
    const raw = Buffer.alloc((stride + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (stride + 1)] = PNG_FILTER_NONE;
        for (let x = 0; x < width; x++) {
            raw.set(
                pixels[y * width + x],
                y * (stride + 1) + 1 + x * PNG_CHANNELS
            );
        }
    }

    return Buffer.concat([
        PNG_SIGNATURE,
        buildChunk(CHUNK_TYPES.HEADER, header),
        buildChunk(CHUNK_TYPES.DATA, deflateSync(raw)),
        buildChunk(CHUNK_TYPES.END, Buffer.alloc(0)),
    ]);
};
