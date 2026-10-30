import type { LibrarySeedAnswer } from "../../../types";
import { SEED_GROUPS } from "../../seedLibrary/consts";
import { CONTENT_APPLY_MESSAGES, SEED_ACTIONS } from "./consts";
import { countSeedAction } from "./countSeedAction";

// One line for each section of the seed result that has entries, with how
// many were created, updated and left as they were.
export const summarizeSeedAnswer = (result: LibrarySeedAnswer): string[] =>
    SEED_GROUPS.filter(({ group }) => result[group].length > 0).map(
        ({ group, label }) =>
            CONTENT_APPLY_MESSAGES.libraryGroup(
                label,
                countSeedAction(result[group], SEED_ACTIONS.CREATE),
                countSeedAction(result[group], SEED_ACTIONS.UPDATE),
                countSeedAction(result[group], SEED_ACTIONS.UNCHANGED)
            )
    );
