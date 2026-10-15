import { LAYOUT_ISSUE_CODES, type LayoutIssue } from "@standin/contracts";
import { AREA_ISSUE_MESSAGES } from "../consts/messages";

// The line of the list of problems for an issue of the capture, in the
// language of the interface when the code is one the composer knows.
export const describeAreaIssue = (issue: LayoutIssue): string => {
    switch (issue.code) {
        case LAYOUT_ISSUE_CODES.STAMP_TOO_SMALL:
            return AREA_ISSUE_MESSAGES.STAMP_TOO_SMALL;
        case LAYOUT_ISSUE_CODES.STAMP_TOO_LARGE:
            return AREA_ISSUE_MESSAGES.STAMP_TOO_LARGE;
        case LAYOUT_ISSUE_CODES.STAMP_EMPTY:
            return AREA_ISSUE_MESSAGES.STAMP_EMPTY;
        case LAYOUT_ISSUE_CODES.STAMP_TOO_MANY_OBJECTS:
            return AREA_ISSUE_MESSAGES.STAMP_TOO_MANY_OBJECTS;
        case LAYOUT_ISSUE_CODES.STAMP_OBJECT_CROSSES_EDGE:
            return AREA_ISSUE_MESSAGES.STAMP_OBJECT_CROSSES_EDGE;
        case LAYOUT_ISSUE_CODES.STAMP_PARENT_OUTSIDE:
            return AREA_ISSUE_MESSAGES.STAMP_PARENT_OUTSIDE;
        case LAYOUT_ISSUE_CODES.STAMP_ASSET_UNAVAILABLE:
            return AREA_ISSUE_MESSAGES.STAMP_ASSET_UNAVAILABLE;
        case LAYOUT_ISSUE_CODES.STAMP_TILESET_UNAVAILABLE:
            return AREA_ISSUE_MESSAGES.STAMP_TILESET_UNAVAILABLE;
        case LAYOUT_ISSUE_CODES.STAMP_DOOR_NEEDS_ROOM:
            return AREA_ISSUE_MESSAGES.STAMP_DOOR_NEEDS_ROOM;
        case LAYOUT_ISSUE_CODES.STAMP_DOOR_OUTSIDE_ROOM:
            return AREA_ISSUE_MESSAGES.STAMP_DOOR_OUTSIDE_ROOM;
        default:
            return issue.message;
    }
};
