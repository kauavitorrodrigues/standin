import type { ContentLibrary, ContentLibraryResult } from "../../../types";
import { summarizeCounts } from "../shared/summarizeCounts";
import { CONTENT_APPLY_MESSAGES } from "./consts";
import { summarizeSeedAnswer } from "./summarizeSeedAnswer";

// What a person reads about the library step.
export const buildLibraryLines = (
    library: ContentLibrary,
    result: ContentLibraryResult
): string[] => {
    if (result.dryRun) {
        return [
            CONTENT_APPLY_MESSAGES.libraryDryRun(
                library.images.length,
                summarizeCounts(result.counts)
            ),
            CONTENT_APPLY_MESSAGES.libraryDryRunNote,
        ];
    }
    return [
        CONTENT_APPLY_MESSAGES.librarySeeded,
        ...summarizeSeedAnswer(result.result),
    ];
};
