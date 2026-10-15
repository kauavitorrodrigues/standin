import { LAYOUT_ISSUE_CODES, type LayoutIssueCode } from "@standin/contracts";
import { ROOM_WALLS_MESSAGES } from "@/features/editor/consts/room-walls";

// Why the walls of a room could not be drawn, for the panel.
export const describeWallIssue = (code: LayoutIssueCode): string => {
    switch (code) {
        case LAYOUT_ISSUE_CODES.ROOM_TOO_SMALL_FOR_WALLS:
            return ROOM_WALLS_MESSAGES.TOO_SMALL;
        case LAYOUT_ISSUE_CODES.WALL_SHAPE_UNSUPPORTED:
            return ROOM_WALLS_MESSAGES.SHAPE_UNSUPPORTED;
        case LAYOUT_ISSUE_CODES.WALL_STYLE_INCOMPLETE:
            return ROOM_WALLS_MESSAGES.STYLE_INCOMPLETE;
        default:
            return ROOM_WALLS_MESSAGES.FAILED;
    }
};
