import type { EditorOp, Zone } from "@standin/contracts";
import { ZONE_KINDS } from "@/features/maps/__shared__/consts/zone-kinds";
import type { ZoneRect } from "@/features/maps/__shared__/types/zone-rect";

type Params = {
    zone: Zone;
    rect: ZoneRect;
    // The new name of an area. Without it the area keeps its own.
    label?: string;
};

// The set_zone that rewrites an existing zone (by its id) with a new
// rectangle and, for an area, a name. A spawn carries no name.
export const buildZoneSetOp = ({ zone, rect, label }: Params): EditorOp => {
    const kind =
        zone.kind === ZONE_KINDS.AREA ? ZONE_KINDS.AREA : ZONE_KINDS.SPAWN;

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
        case ZONE_KINDS.SPAWN:
            return {
                type: "set_zone",
                zone: { id: zone.id, kind, rect },
            };
    }
};
