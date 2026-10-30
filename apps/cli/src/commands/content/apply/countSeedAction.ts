import type { SeedAnswerItem } from "../../../types";

// How many entries of a section of the seed result took the action.
export const countSeedAction = (
    items: SeedAnswerItem[],
    action: string
): number => items.filter((item) => item.action === action).length;
