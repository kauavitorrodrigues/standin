import { PNG } from "pngjs";

// Fixed options, so the same pixels always give the same bytes.
const DEFLATE_LEVEL = 9;
const RGBA_COLOR_TYPE = 6;
const BIT_DEPTH = 8;

/** Encodes RGBA pixels (4 bytes per pixel) as a PNG with fixed settings. */
export const encodeRgbaPng = (
    width: number,
    height: number,
    rgba: Uint8Array
): Buffer => {
    const png = new PNG({ width, height });
    png.data = Buffer.from(rgba.buffer, rgba.byteOffset, rgba.length);
    return PNG.sync.write(png, {
        deflateLevel: DEFLATE_LEVEL,
        colorType: RGBA_COLOR_TYPE,
        inputColorType: RGBA_COLOR_TYPE,
        bitDepth: BIT_DEPTH,
        inputHasAlpha: true,
    });
};
