import { TILE_SIZE, type Zone } from "@standin/contracts";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";

// The rectangle of a zone in tiles, as set_zone takes it.
export const getZoneTileRect = (zone: Zone): ZoneRect => ({
    x: zone.x / TILE_SIZE,
    y: zone.y / TILE_SIZE,
    w: zone.width / TILE_SIZE,
    h: zone.height / TILE_SIZE,
});
