// The reasons the editor refuses a door. They are not layout issues, since the
// rule lives in the editor until the contracts carry it.
export const DOOR_PLACEMENT_REASONS = {
    OUTSIDE_ROOM: "DOOR_OUTSIDE_PRIVATE_ZONE",
    AMBIGUOUS_ROOM: "DOOR_AMBIGUOUS_ROOM",
    // Only in the area composer: the area is not set to be a room.
    AREA_NOT_ROOM: "DOOR_AREA_NOT_ROOM",
} as const;
