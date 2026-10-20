import {
    AVATAR_PART_MAX_BYTES,
    AvatarPreviewInvalidError,
    AvatarSheetTooLargeError,
} from "@standin/contracts";
import { readPngSize } from "../../../lib/readPngSize";

/**
 * Checks the PNG of a preview from its bytes. A preview is only shown in the
 * interface, so any PNG is accepted, with or without alpha, and there is no
 * check of the size in pixels.
 */
export const validateAvatarPreview = (buffer: Buffer): void => {
    if (buffer.length > AVATAR_PART_MAX_BYTES) {
        throw new AvatarSheetTooLargeError();
    }
    const size = readPngSize(buffer);
    if (!size || size.width === 0 || size.height === 0) {
        throw new AvatarPreviewInvalidError();
    }
};
