import { ZONE_SELECTION } from "@/features/editor/consts/zone-selection";

// The selection holds plain string ids. A zone id is a number of the layout,
// so it gets a prefix and can never be taken for the id of a placed object.
export const toZoneSelectionId = (zoneId: number): string =>
    `${ZONE_SELECTION.ID_PREFIX}${zoneId}`;
