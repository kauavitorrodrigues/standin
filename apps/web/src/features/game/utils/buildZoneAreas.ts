import { LAYOUT_ZONE_KINDS, type Zone } from "@standin/contracts";
import type { HoverTarget } from "@/features/game/types/hover";

const NAMED_ZONE_KINDS: readonly string[] = [
    LAYOUT_ZONE_KINDS.AREA,
    LAYOUT_ZONE_KINDS.PRIVATE,
];

/**
 * The zones that are a place to go to: an area or a room that has a name. They
 * are outlined and named under the mouse, and a double click walks to them. A
 * zone with no name is only a part of the floor, and the tiles in it are
 * walked to one by one. The bounds of a zone that is not a rectangle are its
 * box.
 */
export const buildZoneAreas = (zones: readonly Zone[]): HoverTarget[] =>
    zones.flatMap((zone, index) => {
        if (!NAMED_ZONE_KINDS.includes(zone.kind)) return [];

        const label = zone.label?.trim();
        if (!label) return [];

        return [
            {
                id: `zone:${zone.key ?? index}`,
                label,
                bounds: {
                    x: zone.x,
                    y: zone.y,
                    width: zone.width,
                    height: zone.height,
                },
            },
        ];
    });
