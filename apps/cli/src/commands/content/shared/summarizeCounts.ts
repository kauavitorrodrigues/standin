import type { LibraryCounts } from "../../../types";
import { SEED_GROUPS } from "../../seedLibrary/consts";

// The sections of library.json that have entries, as `2 tilesets, 1 assets`.
export const summarizeCounts = (counts: LibraryCounts): string =>
    SEED_GROUPS.filter(({ group }) => counts[group] > 0)
        .map(({ group }) => `${counts[group]} ${group}`)
        .join(", ");
