import type { USAGE_LEVELS } from "@/features/editor/consts/usage";

export type UsageLevel = (typeof USAGE_LEVELS)[keyof typeof USAGE_LEVELS];
