import {
    ImageFileRequiredIssue,
    MAX_TILESET_IMAGE_PX,
    MAX_UPLOAD_BYTES,
    PngDimensionsExceededIssue,
    PngInvalidIssue,
    PngTooLargeError,
} from "@standin/contracts";
import type { LibraryIssue } from "@standin/contracts";
import { readPngSize } from "../../../lib/readPngSize";
import type { ImageSize } from "../../../lib/types";

type Result = { size: ImageSize | null; issues: LibraryIssue[] };

/**
 * Checks the PNG of an upload from its bytes: the signature, the size in
 * bytes and the dimensions from the IHDR chunk. The file name and the mime
 * type sent by the client are not trusted. Too many bytes throws (413), the
 * other problems come back as issues so they can join the rest of the
 * validation.
 */
export const readUploadedPng = (buffer: Buffer | undefined): Result => {
    if (!buffer) return { size: null, issues: [new ImageFileRequiredIssue()] };
    if (buffer.length > MAX_UPLOAD_BYTES) throw new PngTooLargeError();

    const size = readPngSize(buffer);
    if (!size) return { size: null, issues: [new PngInvalidIssue()] };

    if (
        size.width > MAX_TILESET_IMAGE_PX ||
        size.height > MAX_TILESET_IMAGE_PX
    ) {
        return { size: null, issues: [new PngDimensionsExceededIssue()] };
    }
    return { size, issues: [] };
};
