import { FILE_PROBLEMS } from "../consts/messages";
import type { CliFiles, PngReadResult } from "../types";
import { describeReadFailure } from "./describeReadFailure";
import { formatBytes } from "./formatBytes";
import { isPng } from "./isPng";

// Reads a PNG and checks what can be checked without decoding it: that it can
// be read, that it is within the limit (the size is asked first, a file that
// is too large is never read) and that it starts as a PNG does. The problem is
// a phrase that follows the name of the file.
export const readPngFile = async (
    files: CliFiles,
    path: string,
    maxBytes: number
): Promise<PngReadResult> => {
    let bytes: Uint8Array;
    try {
        const size: number = await files.fileSize(path);
        if (size > maxBytes) {
            return {
                ok: false,
                problem: FILE_PROBLEMS.tooLarge(
                    formatBytes(size),
                    formatBytes(maxBytes)
                ),
            };
        }
        bytes = await files.readBytes(path);
    } catch (error) {
        return { ok: false, problem: describeReadFailure(error) };
    }
    if (!isPng(bytes)) return { ok: false, problem: FILE_PROBLEMS.notPng };
    return { ok: true, bytes };
};
