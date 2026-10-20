const CHANNELS = 4;
const ALPHA_OFFSET = 3;
const TRANSPARENT = 0;
const OPAQUE = 255;

/** Whether any pixel has an alpha that is neither 0 nor 255. */
export const hasIntermediateAlpha = (rgba: Uint8Array): boolean => {
    for (let offset = ALPHA_OFFSET; offset < rgba.length; offset += CHANNELS) {
        const alpha = rgba[offset];
        if (alpha !== TRANSPARENT && alpha !== OPAQUE) return true;
    }
    return false;
};
