import type { MapLayout } from "../../schemas/layout.schema";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import { isCellInside } from "./isCellInside";

/** The issue for the first cell outside the map, or null when all are inside. */
export const findOutsideCell = (
    layout: MapLayout,
    cells: [number, number][]
): LayoutIssue | null => {
    const outside = cells.find((cell) => !isCellInside(layout, cell));
    if (!outside) return null;

    return createIssue(
        Code.CELL_OUT_OF_BOUNDS,
        `${outside[0]},${outside[1]}`,
        Messages.cellOutOfBounds
    );
};
