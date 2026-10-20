import { getDominantColor } from "@/features/assets/utils/getDominantColor";
import { OUTLINE_MAX_CHANNEL } from "../../consts/partCreate";

const CHANNELS = 4;

const isOutlinePixel = (data: ArrayLike<number>, offset: number) =>
    data[offset] <= OUTLINE_MAX_CHANNEL &&
    data[offset + 1] <= OUTLINE_MAX_CHANNEL &&
    data[offset + 2] <= OUTLINE_MAX_CHANNEL;

// The pixels of the sheet without the near black ones, packed one after the
// other. The outline of the art is the biggest group of pixels of a hat or a
// shoe, and it would hide the color of the piece.
export const dropOutlinePixels = (data: ArrayLike<number>): Uint8Array => {
    const kept = new Uint8Array(data.length);
    let length = 0;

    for (let offset = 0; offset < data.length; offset += CHANNELS) {
        if (isOutlinePixel(data, offset)) continue;
        kept[length] = data[offset];
        kept[length + 1] = data[offset + 1];
        kept[length + 2] = data[offset + 2];
        kept[length + 3] = data[offset + 3];
        length += CHANNELS;
    }
    return kept.subarray(0, length);
};

// The predominant color of a sheet as `#RRGGBB`, looking past the outline. A
// sheet that is only dark gives its dark color, and one with no visible pixel
// gives null.
export const getSheetDominantColor = (data: ArrayLike<number>): string | null =>
    getDominantColor(dropOutlinePixels(data)) ?? getDominantColor(data);
