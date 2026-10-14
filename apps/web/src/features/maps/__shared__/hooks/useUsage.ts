import { useDraftSelector } from "@/features/maps/__shared__/hooks/useDraftSelector";
import { getUsageLevel } from "@/features/maps/__shared__/utils/getUsageLevel";
import { getUsagePercent } from "@/features/maps/__shared__/utils/getUsagePercent";

// How many objects the draft uses, the limit, and the level of the meter. It
// reads the draft, not the numbers the server sent when the editor opened.
export const useUsage = () => {
    const limits = useDraftSelector((state) => state.draft.limits);

    return {
        used: limits.objectsUsed,
        max: limits.objectsMax,
        percent: getUsagePercent(limits.objectsUsed, limits.objectsMax),
        level: getUsageLevel(limits.objectsUsed, limits.objectsMax),
    };
};
