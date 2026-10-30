import { ApiResponseInvalidError } from "../../../errors/ApiResponseInvalidError";
import type { LibraryDryRunAnswer, LibraryCounts } from "../../../types";
import { SEED_GROUPS } from "../../seedLibrary/consts";

// The answer of a dry run of the seed: the count of each section.
export const readSeedPreview = (answer: LibraryDryRunAnswer): LibraryCounts => {
    const counts: LibraryCounts | undefined = answer.counts;
    if (typeof counts !== "object" || counts === null) {
        throw new ApiResponseInvalidError();
    }
    for (const { group } of SEED_GROUPS) {
        if (typeof counts[group] !== "number") {
            throw new ApiResponseInvalidError();
        }
    }
    return counts;
};
