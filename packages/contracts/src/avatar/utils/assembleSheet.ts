import { AVATAR_SHEET_PX } from "../consts/dimensions";
import { AvatarSheetInvalidSizeError } from "../errors";
import type { AvatarLayer } from "../types/layer";

const CHANNELS = 4;
const CHANNEL_MAX = 255;

export const AVATAR_SHEET_BYTES =
    AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h * CHANNELS;

// Integer division of n by d rounding half up.
const divideRounded = (n: number, d: number) =>
    Math.floor((2 * n + d) / (2 * d));

// Puts one layer over `output`, in place, with the same "source over
// destination" of `compositeOver`: 8 bits, straight alpha, every division
// rounding half up. It works on the bytes directly, with no array per pixel,
// which is what makes the assembly fast. The result is the same everywhere.
export const compositeLayerOver = (
    output: Uint8Array,
    rgba: Uint8Array
): void => {
    if (rgba.length !== AVATAR_SHEET_BYTES) {
        throw new AvatarSheetInvalidSizeError();
    }

    for (let offset = 0; offset < AVATAR_SHEET_BYTES; offset += CHANNELS) {
        const sourceAlpha = rgba[offset + 3];
        if (sourceAlpha === 0) continue;

        const destinationAlpha = output[offset + 3];
        if (sourceAlpha === CHANNEL_MAX || destinationAlpha === 0) {
            output[offset] = rgba[offset];
            output[offset + 1] = rgba[offset + 1];
            output[offset + 2] = rgba[offset + 2];
            output[offset + 3] = sourceAlpha;
            continue;
        }

        // Alphas scaled by 255 to stay in integers.
        const behind = destinationAlpha * (CHANNEL_MAX - sourceAlpha);
        const total = sourceAlpha * CHANNEL_MAX + behind;
        for (let channel = 0; channel < 3; channel++) {
            output[offset + channel] = divideRounded(
                rgba[offset + channel] * sourceAlpha * CHANNEL_MAX +
                    output[offset + channel] * behind,
                total
            );
        }
        output[offset + 3] = divideRounded(total, CHANNEL_MAX);
    }
};

// Puts the layers, already in drawing order (see `orderLayers`, which puts the
// base between the back and the front layers), on top of each other and
// returns the RGBA of the sheet. It uses only integer math over the arrays, so
// the same input gives the same bytes on the server and in the browser.
export const assembleSheet = (layers: readonly AvatarLayer[]): Uint8Array => {
    const output = new Uint8Array(AVATAR_SHEET_BYTES);

    for (const layer of layers) {
        compositeLayerOver(output, layer.rgba);
    }

    return output;
};
