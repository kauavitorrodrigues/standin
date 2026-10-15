import type { StampZoneKind } from "../consts/stamp-zone-kinds";

export type CaptureStampOptions = {
    // Name of the area zone the stamp creates when placed. Null for no zone.
    zoneLabel: string | null;
    // The kind of that zone: `area` (the default) or `private`, a room.
    zoneKind?: StampZoneKind;
    // The layer the ground of the stamp is read from. The composer keeps it on
    // the ground layer (the default), a map on the floor layer of its areas.
    groundLayer?: string;
};
