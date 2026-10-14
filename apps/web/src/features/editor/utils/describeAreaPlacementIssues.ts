import type { LayoutIssue } from "@standin/contracts";
import { AREA_PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import { describeAreaPlacementReason } from "@/features/editor/utils/describeAreaPlacementReason";

// The footer line for a placement that failed: the reason of the first issue.
export const describeAreaPlacementIssues = (
    issues: readonly LayoutIssue[]
): string => {
    const [issue] = issues;
    if (!issue) return AREA_PLACEMENT_MESSAGES.PLACE_FAILED;
    return describeAreaPlacementReason(issue.code);
};
