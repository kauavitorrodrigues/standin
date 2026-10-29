import type { EditorModel } from "@standin/contracts";
import { AUTHORING_ISSUE_CODES, createIssue } from "../issues";
import type { AuthoringIssue } from "../types";

// A zone is not checked against the border when it is applied, so the builders
// that write one ask for it, with the code a cell outside the map has.
export const checkRectInMap = (
    model: Pick<EditorModel, "width" | "height">,
    area: string,
    { x, y, w, h }: { x: number; y: number; w: number; h: number }
): AuthoringIssue[] => {
    const inside =
        x >= 0 && y >= 0 && x + w <= model.width && y + h <= model.height;
    if (inside) return [];

    return [
        createIssue(AUTHORING_ISSUE_CODES.CELL_OUT_OF_BOUNDS, area, {
            area,
            width: model.width,
            height: model.height,
        }),
    ];
};
