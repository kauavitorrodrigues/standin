import { LAYOUT_ZONE_KINDS, type Zone } from "@standin/contracts";
import type { ZoneShape } from "@/features/editor/types/zone-shape";

const HALF = 2;

const getOutline = (zone: Zone) => {
    if (zone.polygon && zone.polygon.length > 0) {
        return zone.polygon.map((point) => ({
            x: zone.x + point.x,
            y: zone.y + point.y,
        }));
    }

    return [
        { x: zone.x, y: zone.y },
        { x: zone.x + zone.width, y: zone.y },
        { x: zone.x + zone.width, y: zone.y + zone.height },
        { x: zone.x, y: zone.y + zone.height },
    ];
};

/**
 * What to draw for a zone, in pixels: a point for a spawn (the center of its
 * rectangle) and an outline for every other kind, with the text of its label,
 * or of its name when it has none.
 */
export const getZoneShape = (zone: Zone): ZoneShape => {
    if (zone.kind === LAYOUT_ZONE_KINDS.SPAWN) {
        return {
            kind: "spawn",
            x: zone.x + zone.width / HALF,
            y: zone.y + zone.height / HALF,
        };
    }

    return {
        kind: "area",
        outline: getOutline(zone),
        labelX: zone.x,
        labelY: zone.y,
        label: zone.label ?? zone.name ?? "",
    };
};
