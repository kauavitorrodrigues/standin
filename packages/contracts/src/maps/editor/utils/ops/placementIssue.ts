import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
    type LayoutIssueCode,
} from "../../../layout/issues";

const messageFor = (reason: LayoutIssueCode): string => {
    switch (reason) {
        case Code.CELL_OUT_OF_BOUNDS:
            return Messages.cellOutOfBounds;
        case Code.TOO_MANY_OBJECTS:
            return Messages.tooManyObjects;
        case Code.CELL_BLOCKED_BY_WALL:
            return Messages.cellBlockedByWall;
        case Code.NOT_ON_SURFACE:
            return Messages.notOnSurface;
        case Code.NOT_ON_WALL:
            return Messages.notOnWall;
        case Code.FOOTPRINT_OVERLAP:
            return Messages.footprintOverlap;
        default:
            return Messages.layoutInvalid;
    }
};

/** Issue for the reason canPlaceAsset refused a placement. */
export const placementIssue = (
    reason: LayoutIssueCode,
    path: string
): LayoutIssue => createIssue(reason, path, messageFor(reason));
