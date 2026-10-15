import { LAYOUT_ZONE_KINDS, type Zone } from "@standin/contracts";
import type { GameRoom } from "@/features/game/types/room";

/**
 * The rooms of the map: the `private` zones that have a `key`, which is how
 * the server knows them. A zone with no key cannot be locked, so it is no room.
 * The zones come from `readZones` on the layout, or from `objectToZone` on the
 * objects of the `zones` layer of the tilemap. Positions are already in px.
 */
export const buildRooms = (zones: readonly Zone[]): GameRoom[] =>
    zones.flatMap((zone) => {
        if (zone.kind !== LAYOUT_ZONE_KINDS.PRIVATE) return [];
        if (zone.key === undefined) return [];

        return [
            {
                key: zone.key,
                label: zone.label ?? zone.key,
                x: zone.x,
                y: zone.y,
                width: zone.width,
                height: zone.height,
                ...(zone.polygon ? { polygon: zone.polygon } : {}),
            },
        ];
    });
