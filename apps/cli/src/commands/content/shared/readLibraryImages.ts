import { MAX_SEED_TOTAL_BYTES } from "@standin/contracts";
import type {
    ContentRoot,
    CliFiles,
    ErrorIssue,
    LibraryFileRef,
    LibraryImageRead,
    LibraryImagesScan,
    PngFile,
} from "../../../types";
import { formatBytes } from "../../../utils/formatBytes";
import {
    CONTENT_MESSAGES,
    LIBRARY_FILE,
    PART_OVERHEAD_BYTES,
    SEED_FILES_LIMIT,
} from "../consts";
import { readLibraryImage } from "./readLibraryImage";

// Reads each PNG library.json names, once even when it is named twice. A file
// that cannot be used is an issue at the place that names it. The limits of
// the upload are kept while reading: more files than the server takes, and
// nothing is read; a total over the limit, and the reading stops there.
export const readLibraryImages = async (
    files: CliFiles,
    root: ContentRoot,
    refs: LibraryFileRef[],
    textBytes: number
): Promise<LibraryImagesScan> => {
    const unique: LibraryFileRef[] = refs.filter(
        (ref, index) =>
            refs.findIndex((other) => other.file === ref.file) === index
    );
    if (unique.length > SEED_FILES_LIMIT) {
        return {
            images: [],
            issues: [
                {
                    file: LIBRARY_FILE,
                    message: CONTENT_MESSAGES.tooManyFiles(unique.length),
                },
            ],
        };
    }

    const images: PngFile[] = [];
    const issues: ErrorIssue[] = [];
    let total: number = textBytes + PART_OVERHEAD_BYTES;
    for (const ref of unique) {
        const read: LibraryImageRead = await readLibraryImage(files, root, ref);
        if (!read.ok) {
            issues.push(read.issue);
            continue;
        }
        images.push(read.image);
        total += read.image.bytes.length + PART_OVERHEAD_BYTES;
        if (total > MAX_SEED_TOTAL_BYTES) {
            issues.push({
                file: LIBRARY_FILE,
                message: CONTENT_MESSAGES.uploadTooLarge(
                    formatBytes(total),
                    formatBytes(MAX_SEED_TOTAL_BYTES)
                ),
            });
            break;
        }
    }
    return { images, issues };
};
