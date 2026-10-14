import type { ZONE_HANDLES } from "@/features/editor/consts/zone-handles";

export type ZoneHandle = (typeof ZONE_HANDLES)[keyof typeof ZONE_HANDLES];
