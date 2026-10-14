import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";

export const isSameZoneRect = (a: ZoneRect, b: ZoneRect): boolean =>
    a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
