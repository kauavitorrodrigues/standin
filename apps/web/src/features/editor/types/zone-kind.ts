import type { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";

export type ZoneKind = (typeof ZONE_KINDS)[keyof typeof ZONE_KINDS];
