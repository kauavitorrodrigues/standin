import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
    type LayoutIssueCode,
} from "../../../layout/issues";
import type { TileConflict } from "../../types/tile-conflict";
import type { TileConflictOp } from "../../types/tile-conflict-op";

const messageFor = (code: LayoutIssueCode): string => {
    switch (code) {
        case Code.CELL_OCCUPIED_BY_OBJECT:
            return Messages.cellOccupiedByObject;
        case Code.WALL_HAS_MOUNTED_OBJECT:
            return Messages.wallHasMountedObject;
        default:
            return Messages.layoutInvalid;
    }
};

/** One issue per conflicting cell, with the cell in the path. */
export const tileConflictIssues = (
    op: TileConflictOp,
    conflicts: TileConflict[]
): LayoutIssue[] =>
    conflicts.map(({ cell, code }) =>
        createIssue(
            code,
            `op.${op.type}.cells.${cell[0]},${cell[1]}`,
            messageFor(code)
        )
    );
