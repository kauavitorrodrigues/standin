import type { Dimensions } from "../../../../lib/types";
import {
    LAYOUT_ISSUE_CODES,
    LAYOUT_ISSUE_MESSAGES,
    MAX_THUMBNAIL_ASPECT_DRIFT,
    createIssue,
} from "@standin/contracts";
import type { LayoutIssue, UploadFileInput } from "@standin/contracts";
import { readPngSize } from "../../../../lib/readPngSize";

/**
 * A warning when the thumbnail proportion drifts from the map's. It is only a
 * warning, since the thumbnail is regenerated after edits.
 */
export const checkThumbnailAspect = (
    file: UploadFileInput,
    map: Dimensions
): LayoutIssue[] => {
    const size = readPngSize(file.buffer);
    if (!size) return [];

    const mapRatio = map.width / map.height;
    const drift = Math.abs(size.width / size.height - mapRatio) / mapRatio;
    if (drift <= MAX_THUMBNAIL_ASPECT_DRIFT) return [];

    return [
        createIssue(
            LAYOUT_ISSUE_CODES.THUMBNAIL_ASPECT_MISMATCH,
            "thumbnail",
            LAYOUT_ISSUE_MESSAGES.thumbnailAspectMismatch
        ),
    ];
};
