import {
    AVATAR_PART_MAX_BYTES,
    AVATAR_SHEET_PX,
    AvatarSheetInvalidFormatError,
    AvatarSheetInvalidSizeError,
    AvatarSheetTooLargeError,
} from "@standin/contracts";
import { decodePng } from "../../../lib/decodePng";
import {
    PNG_BIT_DEPTH_8,
    PNG_BIT_DEPTH_OFFSET,
    PNG_COLOR_TYPE_OFFSET,
    PNG_COLOR_TYPE_RGBA,
} from "../../../lib/consts/png";
import { readPngSize } from "../../../lib/readPngSize";
import type { AvatarSheetWarning } from "../types";
import { hasIntermediateAlpha } from "./hasIntermediateAlpha";

type Result = { rgba: Uint8Array; warnings: AvatarSheetWarning[] };

const hasRgbaHeader = (buffer: Buffer): boolean =>
    buffer[PNG_BIT_DEPTH_OFFSET] === PNG_BIT_DEPTH_8 &&
    buffer[PNG_COLOR_TYPE_OFFSET] === PNG_COLOR_TYPE_RGBA;

/**
 * Checks the PNG of one sheet of a part from its bytes and decodes it. The
 * cheap checks come first (bytes, signature, size in the header, color type),
 * so a wrong file is refused before the decoder runs. Pixels with a partial
 * alpha are accepted with a warning, because the preview of the browser may
 * not match the server for them.
 */
export const validateAvatarSheet = (buffer: Buffer): Result => {
    if (buffer.length > AVATAR_PART_MAX_BYTES) {
        throw new AvatarSheetTooLargeError();
    }

    const size = readPngSize(buffer);
    if (!size) throw new AvatarSheetInvalidFormatError();
    if (size.width !== AVATAR_SHEET_PX.w || size.height !== AVATAR_SHEET_PX.h) {
        throw new AvatarSheetInvalidSizeError();
    }
    if (!hasRgbaHeader(buffer)) throw new AvatarSheetInvalidFormatError();

    let rgba: Uint8Array;
    try {
        rgba = decodePng(buffer).data;
    } catch {
        throw new AvatarSheetInvalidFormatError();
    }

    const warnings: AvatarSheetWarning[] = hasIntermediateAlpha(rgba)
        ? [{ sheet: "front", code: "ALPHA_INTERMEDIATE" }]
        : [];
    return { rgba, warnings };
};
