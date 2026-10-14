import { ZONE_AREA_MIN_TILES } from "@standin/contracts";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";

export const isAreaBigEnough = ({ w, h }: ZoneRect): boolean =>
    w >= ZONE_AREA_MIN_TILES && h >= ZONE_AREA_MIN_TILES;
