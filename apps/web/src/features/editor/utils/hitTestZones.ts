import type { Zone } from "@standin/contracts";
import { ZONE_SELECTION } from "@/features/editor/consts/zone-selection";
import type { SelectionTarget } from "@/features/editor/types/SelectionTarget";
import { isEditableZone } from "@/features/editor/utils/isEditableZone";
import { toZoneSelectionId } from "@/features/editor/utils/toZoneSelectionId";

type Params = {
    zones: readonly Zone[];
    worldX: number;
    worldY: number;
};

// The zone under the point. A point counts inside the rectangle of the zone
// (a spawn takes its whole cell). Of several zones the one with the smallest
// area wins, so a spawn or a small area inside a big one stays reachable. The
// depth is the same for all of them (see ZONE_SELECTION).
export const hitTestZones = ({
    zones,
    worldX,
    worldY,
}: Params): SelectionTarget | null => {
    let best: SelectionTarget | null = null;

    for (const zone of zones) {
        if (zone.id === undefined || !isEditableZone(zone)) continue;

        const insideX = worldX >= zone.x && worldX < zone.x + zone.width;
        const insideY = worldY >= zone.y && worldY < zone.y + zone.height;
        if (!insideX || !insideY) continue;

        const area = zone.width * zone.height;
        if (best && best.area <= area) continue;
        best = {
            kind: "zone",
            id: toZoneSelectionId(zone.id),
            depth: ZONE_SELECTION.DEPTH,
            area,
        };
    }

    return best;
};
