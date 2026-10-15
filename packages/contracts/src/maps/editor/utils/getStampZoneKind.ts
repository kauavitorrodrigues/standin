import {
    STAMP_ZONE_KINDS,
    type StampZoneKind,
} from "../consts/stamp-zone-kinds";
import type { Stamp } from "../types/stamp";

/** The kind of the zone a stamp creates. A zone with no kind is an `area`. */
export const getStampZoneKind = (stamp: Pick<Stamp, "zone">): StampZoneKind =>
    stamp.zone?.kind ?? STAMP_ZONE_KINDS.AREA;
