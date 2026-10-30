import type { ClipGroup } from "../types/row";
import type { PanelState } from "../types/panel";
import { resolveGroupVisibility } from "./resolveGroupVisibility";

/**
 * The panel lists its groups, unless every one of them is known to be empty:
 * then it says so, or says that nothing matched when a search is active.
 */
export const resolvePanelState = (
    groups: readonly ClipGroup[],
    hasSearch: boolean
): PanelState => {
    const allEmpty = groups.every(
        (group) => resolveGroupVisibility(group) === "hidden"
    );
    if (!allEmpty) return "groups";
    if (hasSearch) return "no-results";
    return "empty";
};
