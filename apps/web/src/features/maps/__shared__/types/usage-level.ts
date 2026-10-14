import type { USAGE_LEVELS } from "@/features/maps/__shared__/consts/usage";

export type UsageLevel = (typeof USAGE_LEVELS)[keyof typeof USAGE_LEVELS];
