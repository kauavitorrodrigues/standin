import { AVATAR_SHEET_PX } from "@standin/contracts";
import { encodeRgbaPng } from "../../../../lib/encodeRgbaPng";

type Pixel = [number, number, number, number];

/** RGBA bytes of a sheet where every pixel is `pixel`. */
export const sheetPixels = (pixel: Pixel): Uint8Array => {
    const rgba = new Uint8Array(AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h * 4);
    for (let offset = 0; offset < rgba.length; offset += 4) {
        rgba.set(pixel, offset);
    }
    return rgba;
};

/** A valid sheet PNG (right size, RGBA). `pixel` is the color of every pixel. */
export const sheetPng = (pixel: Pixel = [90, 90, 90, 255]): Buffer =>
    encodeRgbaPng(AVATAR_SHEET_PX.w, AVATAR_SHEET_PX.h, sheetPixels(pixel));
