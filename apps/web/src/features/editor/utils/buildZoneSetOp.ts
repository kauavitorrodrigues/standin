import type { EditorOp, Zone } from "@standin/contracts";
import { ZONE_KINDS } from "@/features/editor/consts/zone-kinds";
import type { ZoneRect } from "@/features/editor/types/zone-rect";
import type { ZoneKind } from "@/features/editor/types/zone-kind";

type Params = {
    zone: Zone;
    rect: ZoneRect;
    // The new name of an area or a room. Without it the zone keeps its own.
    label?: string;
};

const getKind = (zone: Zone): ZoneKind => {
    switch (zone.kind) {
        case ZONE_KINDS.AREA:
            return ZONE_KINDS.AREA;
        case ZONE_KINDS.ROOM:
            return ZONE_KINDS.ROOM;
        default:
            return ZONE_KINDS.SPAWN;
    }
};

// The set_zone that rewrites an existing zone (by its id) with a new
// rectangle and, for an area or a room, a name. A room keeps its key, as the
// doors point at it. A spawn carries no name.
export const buildZoneSetOp = ({ zone, rect, label }: Params): EditorOp => {
    const kind = getKind(zone);

    switch (kind) {
        case ZONE_KINDS.AREA:
            return {
                type: "set_zone",
                zone: {
                    id: zone.id,
                    kind,
                    rect,
                    label: label ?? zone.label ?? "",
                },
            };
        case ZONE_KINDS.ROOM:
            return {
                type: "set_zone",
                zone: {
                    id: zone.id,
                    kind,
                    rect,
                    label: label ?? zone.label ?? "",
                    key: zone.key ?? "",
                },
            };
        case ZONE_KINDS.SPAWN:
            return {
                type: "set_zone",
                zone: { id: zone.id, kind, rect },
            };
    }
};
