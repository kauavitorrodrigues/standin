import type { LayoutIssueCode } from "@standin/contracts";
import { PLACEMENT_MESSAGES } from "@/features/maps/__shared__/consts/messages";

// The reason a spot is refused, in words for the footer hint.
export const describePlacementReason = (code: LayoutIssueCode): string => {
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
        default:
            return PLACEMENT_MESSAGES.GENERIC;
    }
};
