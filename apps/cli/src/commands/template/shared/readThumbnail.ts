import { MAX_THUMBNAIL_SIZE_IN_BYTES } from "@standin/contracts";
import { TemplateThumbnailInvalidError } from "../../../errors/TemplateThumbnailInvalidError";
import type { CliEnv, CliFiles, PngFile, PngReadResult } from "../../../types";
import { readPngFile } from "../../../utils/readPngFile";
import { resolveFolder } from "../../../utils/resolveFolder";

// The thumbnail of a template, read and checked to be a PNG before any
// request is sent.
export const readThumbnail = async (
    files: CliFiles,
    env: CliEnv,
    thumbnailPath: string
): Promise<PngFile> => {
    const resolved: string = resolveFolder(thumbnailPath, env);
    const read: PngReadResult = await readPngFile(
        files,
        resolved,
        MAX_THUMBNAIL_SIZE_IN_BYTES
    );
    if (!read.ok) {
        throw new TemplateThumbnailInvalidError(resolved, read.problem);
    }
    return { file: resolved, bytes: read.bytes };
};
