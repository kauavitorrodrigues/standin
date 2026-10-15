import type { LayoutIssue } from "@standin/contracts";
import { ZONE_MESSAGES } from "@/features/editor/consts/messages";

// The reason a zone change was refused, in words for the user. The last spawn
// cannot go: the map needs somewhere to put who enters it.
export const describeZoneFailure = (
    errors: readonly LayoutIssue[],
    fallback: string
): string => {
    const [first] = errors;

    switch (first?.code) {
        case "SPAWN_MISSING":
            return ZONE_MESSAGES.LAST_SPAWN;
        default:
            return fallback;
    }
};
