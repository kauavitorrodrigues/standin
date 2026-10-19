import { AVATAR_PART_MAX_BYTES } from "@standin/contracts";
import { AVATAR_PART_VALIDATION_MESSAGES as Messages } from "../../consts/messages";
import type { PngHeader } from "./readPngHeader";

// The first problem of a preview image that can be seen from its size in bytes
// and its header, or null. A preview is any PNG within the size limit, with no
// grid, because it is only shown in lists and never enters a sheet.
export const getPreviewIssue = (
    sizeInBytes: number,
    header: PngHeader | null
): string | null => {
    if (sizeInBytes > AVATAR_PART_MAX_BYTES) return Messages.PREVIEW_TOO_LARGE;
    if (header === null) return Messages.PREVIEW_NOT_PNG;
    return null;
};
