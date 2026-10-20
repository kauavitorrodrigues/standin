import { AVATAR_PART_MAX_BYTES, AVATAR_SHEET_PX } from "@standin/contracts";
import { PNG_HEADER } from "../../consts/partForms";
import { AVATAR_PART_VALIDATION_MESSAGES as Messages } from "../../consts/messages";
import type { PngHeader } from "./readPngHeader";

// The first problem of a sheet that can be seen from its size in bytes and
// its header, or null. The API decides the rest, such as the alpha.
export const getSheetIssue = (
    sizeInBytes: number,
    header: PngHeader | null
): string | null => {
    if (sizeInBytes > AVATAR_PART_MAX_BYTES) return Messages.TOO_LARGE;
    if (header === null) return Messages.NOT_PNG;

    const isRgba =
        header.colorType === PNG_HEADER.RGBA_COLOR_TYPE &&
        header.bitDepth === PNG_HEADER.EIGHT_BITS;
    if (!isRgba) return Messages.NOT_RGBA;

    const hasGridSize =
        header.width === AVATAR_SHEET_PX.w &&
        header.height === AVATAR_SHEET_PX.h;
    return hasGridSize ? null : Messages.WRONG_SIZE;
};
