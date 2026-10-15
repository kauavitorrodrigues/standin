import { LAYOUT_ISSUE_CODES } from "@standin/contracts";
import type { LayoutIssueCode } from "@standin/contracts";
import { TILE_HINTS } from "@/features/editor/consts/messages";

// Why a cell was left out, for people.
export const getConflictReason = (code: LayoutIssueCode): string => {
    switch (code) {
        case LAYOUT_ISSUE_CODES.CELL_OCCUPIED_BY_OBJECT:
            return TILE_HINTS.CONFLICT_OBJECT;
        case LAYOUT_ISSUE_CODES.WALL_HAS_MOUNTED_OBJECT:
            return TILE_HINTS.CONFLICT_MOUNTED;
        default:
            return TILE_HINTS.CONFLICT_OTHER;
    }
};
