import type { MapLayout, Zone } from "@standin/contracts";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { isEditableZone } from "@/features/editor/utils/isEditableZone";

// The editable zone with this id in the layout, or null.
export const findEditableZone = (
    layout: MapLayout,
    zoneId: number
): Zone | null =>
    getLayoutZones(layout).find(
        (zone) => zone.id === zoneId && isEditableZone(zone)
    ) ?? null;
