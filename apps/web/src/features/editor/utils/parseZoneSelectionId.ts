import { ZONE_SELECTION } from "@/features/editor/consts/zone-selection";

// The zone id inside a selection id, or null when it is not a zone's.
export const parseZoneSelectionId = (selectionId: string): number | null => {
    if (!selectionId.startsWith(ZONE_SELECTION.ID_PREFIX)) return null;

    const zoneId = Number(selectionId.slice(ZONE_SELECTION.ID_PREFIX.length));
    return Number.isInteger(zoneId) ? zoneId : null;
};
