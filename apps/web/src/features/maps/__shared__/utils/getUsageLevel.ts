import {
    USAGE_LEVELS,
    USAGE_WARNING_PERCENT,
} from "@/features/maps/__shared__/consts/usage";
import type { UsageLevel } from "@/features/maps/__shared__/types/usage-level";

// How full the meter is: normal, in warning from 90% on, or full at the limit.
export const getUsageLevel = (used: number, max: number): UsageLevel => {
    if (max <= 0 || used >= max) return USAGE_LEVELS.FULL;

    const percent = (used / max) * 100;
    if (percent >= USAGE_WARNING_PERCENT) return USAGE_LEVELS.WARNING;

    return USAGE_LEVELS.NORMAL;
};
