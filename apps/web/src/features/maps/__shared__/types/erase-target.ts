import type { ERASE_TARGETS } from "@/features/maps/__shared__/consts/erase-targets";

export type EraseTarget = (typeof ERASE_TARGETS)[keyof typeof ERASE_TARGETS];
