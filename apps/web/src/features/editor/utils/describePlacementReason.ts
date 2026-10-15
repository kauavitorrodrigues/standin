import type { PlacementReason } from "@/features/editor/types/PlacementReason";
import { PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";

// The reason a spot is refused, in words for the footer hint.
export const describePlacementReason = (code: PlacementReason): string => {
    switch (code) {
        case "CELL_OUT_OF_BOUNDS":
            return PLACEMENT_MESSAGES.OUT_OF_BOUNDS;
        case "TOO_MANY_OBJECTS":
            return PLACEMENT_MESSAGES.LIMIT_REACHED;
        case "FOOTPRINT_OVERLAP":
        case "CELL_OCCUPIED_BY_OBJECT":
            return PLACEMENT_MESSAGES.OVERLAP;
        case "NOT_ON_SURFACE":
            return PLACEMENT_MESSAGES.NOT_ON_SURFACE;
        case "NOT_ON_WALL":
            return PLACEMENT_MESSAGES.NOT_ON_WALL;
        case "CELL_BLOCKED_BY_WALL":
            return PLACEMENT_MESSAGES.BLOCKED_BY_WALL;
        case "ASSET_NOT_IN_LIBRARY":
            return PLACEMENT_MESSAGES.NOT_IN_LIBRARY;
        case "DOOR_OUTSIDE_PRIVATE_ZONE":
            return PLACEMENT_MESSAGES.DOOR_OUTSIDE_ROOM;
        case "DOOR_AMBIGUOUS_ROOM":
            return PLACEMENT_MESSAGES.DOOR_AMBIGUOUS_ROOM;
        case "DOOR_AREA_NOT_ROOM":
            return PLACEMENT_MESSAGES.DOOR_AREA_NOT_ROOM;
        default:
            return PLACEMENT_MESSAGES.GENERIC;
    }
};
