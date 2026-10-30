import { MAX_SEED_LIBRARY_BYTES } from "@standin/contracts";
import type {
    CliFiles,
    ContentRoot,
    LibraryImagesScan,
    LibraryScan,
    LibraryTextCheck,
    TextReadResult,
} from "../../../types";
import { LIBRARY_FILE } from "../consts";
import { checkLibraryText } from "./checkLibraryText";
import { readInsideText } from "./readInsideText";
import { readLibraryImages } from "./readLibraryImages";

const ENCODER: TextEncoder = new TextEncoder();

// library.json and the PNGs it names, checked as far as it can be without the
// server: the schema, the files, their size and the limits of the upload.
export const readLibraryPart = async (
    files: CliFiles,
    root: ContentRoot
): Promise<LibraryScan> => {
    const read: TextReadResult = await readInsideText(
        files,
        root,
        LIBRARY_FILE,
        MAX_SEED_LIBRARY_BYTES
    );
    if (!read.ok) {
        return { issues: [{ file: LIBRARY_FILE, message: read.problem }] };
    }

    const checked: LibraryTextCheck = checkLibraryText(read.text);
    if (!checked.ok) return { issues: checked.issues };

    const scan: LibraryImagesScan = await readLibraryImages(
        files,
        root,
        checked.refs,
        ENCODER.encode(read.text).length
    );
    return {
        library: {
            text: read.text,
            images: scan.images,
            counts: checked.counts,
        },
        issues: scan.issues,
    };
};
