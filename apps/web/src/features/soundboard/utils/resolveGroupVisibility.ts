import type { ClipGroup, GroupVisibility } from "../types/row";

/**
 * Whether a group has a place in the list. One that is loading or failed is
 * not known to have clips yet, and one known to have none is left out.
 */
export const resolveGroupVisibility = (group: ClipGroup): GroupVisibility => {
    if (group.isLoading || group.isError) return "unknown";
    if (group.clips.length === 0) return "hidden";
    return "listed";
};
