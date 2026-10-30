import { ApiResponseInvalidError } from "../../../errors/ApiResponseInvalidError";
import type { LibrarySeedAnswer } from "../../../types";
import { SEED_GROUPS } from "../../seedLibrary/consts";

// The answer of a real seed: a list for each section. Anything else is not
// the API.
export const readSeedAnswer = (
    answer: LibrarySeedAnswer
): LibrarySeedAnswer => {
    for (const { group } of SEED_GROUPS) {
        if (!Array.isArray(answer[group])) throw new ApiResponseInvalidError();
    }
    return answer;
};
