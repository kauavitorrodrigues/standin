// The zone a stamp creates when placed. An `area` is a named region. A
// `private` zone is a room, the only place a door can stand.
export const STAMP_ZONE_KINDS = {
    AREA: "area",
    PRIVATE: "private",
} as const;

export type StampZoneKind =
    (typeof STAMP_ZONE_KINDS)[keyof typeof STAMP_ZONE_KINDS];
