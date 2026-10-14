import type { ZONE_KINDS } from "@/features/maps/__shared__/consts/zone-kinds";

export type ZoneKind = (typeof ZONE_KINDS)[keyof typeof ZONE_KINDS];
