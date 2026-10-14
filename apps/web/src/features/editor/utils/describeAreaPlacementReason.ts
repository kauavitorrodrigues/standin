import type { LayoutIssueCode } from "@standin/contracts";
import { AREA_PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";

// The reason an area is refused, in words for the footer hint.
export const describeAreaPlacementReason = (code: LayoutIssueCode): string => {
    switch (code) {
        case "STAMP_OUT_OF_BOUNDS":
            return AREA_PLACEMENT_MESSAGES.OUT_OF_BOUNDS;
        case "STAMP_AREA_NOT_EMPTY":
            return AREA_PLACEMENT_MESSAGES.NOT_EMPTY;
        case "STAMP_COVERS_SPAWN":
            return AREA_PLACEMENT_MESSAGES.COVERS_SPAWN;
        case "STAMP_OVERLAPS_AREA":
            return AREA_PLACEMENT_MESSAGES.OVERLAPS_AREA;
        case "TOO_MANY_OBJECTS":
            return AREA_PLACEMENT_MESSAGES.LIMIT_REACHED;
        case "STAMP_TILESET_UNAVAILABLE":
            return AREA_PLACEMENT_MESSAGES.TILESET_UNAVAILABLE;
        case "STAMP_ASSET_UNAVAILABLE":
            return AREA_PLACEMENT_MESSAGES.ASSET_UNAVAILABLE;
        default:
            return AREA_PLACEMENT_MESSAGES.PLACE_FAILED;
    }
};
