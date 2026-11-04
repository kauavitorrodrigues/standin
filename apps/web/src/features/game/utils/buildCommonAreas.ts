import { LAYOUT_ZONE_KINDS, type Zone } from "@standin/contracts";
import type { GameRoom } from "@/features/game/types/room";

/**
 * The common areas of the map: the `area` zones that have a name, in px. They
 * share the shape of a room so `getRoomAt` finds the one a point is in. A
 * private room is not one: it is a place to be alone.
 */
export const buildCommonAreas = (zones: readonly Zone[]): GameRoom[] =>
    zones.flatMap((zone, index) => {
        if (zone.kind !== LAYOUT_ZONE_KINDS.AREA) return [];

        const label = zone.label?.trim();
        if (!label) return [];

        const area: GameRoom = {
            key: zone.key ?? `area:${index}`,
            label,
            x: zone.x,
            y: zone.y,
            width: zone.width,
            height: zone.height,
        };
        
        if (zone.polygon) area.polygon = zone.polygon;
        
        return [area];
    });
