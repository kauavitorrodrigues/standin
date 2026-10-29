import {
    SOLID_MASK_SUBDIVISION,
    isFootprintMaskFitting,
    isFootprintSolidMaskFitting,
} from "@standin/contracts";
import type { FootprintMask } from "@standin/contracts";
import { AUTHORING_ISSUE_CODES, createIssue } from "../issues";
import type {
    AuthoringIssue,
    CellRect,
    FootprintMasksInput,
    FootprintMasksResult,
} from "../types";

/**
 * A mask of `columns` x `rows` cells with the cells of `rect` set. Without a
 * rect every cell is set. Cells of the rect outside the mask are ignored.
 */
export const createRectMask = (
    columns: number,
    rows: number,
    rect?: CellRect
): FootprintMask =>
    Array.from({ length: rows }, (_, y) =>
        Array.from(
            { length: columns },
            (_, x) =>
                !rect ||
                (x >= rect.x &&
                    x < rect.x + rect.w &&
                    y >= rect.y &&
                    y < rect.y + rect.h)
        )
    );

/**
 * The `mask` and `solidMask` of an asset footprint from rectangles, in the
 * format the asset schema asks for. They are checked with the same functions
 * the schema uses, so a pair that passes here is accepted by the library.
 */
export const createFootprintMasks = ({
    w,
    h,
    occupied,
    solid,
}: FootprintMasksInput): FootprintMasksResult => {
    const columns = w * SOLID_MASK_SUBDIVISION;
    const rows = h * SOLID_MASK_SUBDIVISION;
    const mask = occupied ? createRectMask(columns, rows, occupied) : null;
    const solidMask = solid ? createRectMask(columns, rows, solid) : null;

    const issues: AuthoringIssue[] = [];
    if (!isFootprintMaskFitting({ w, h, mask })) {
        issues.push(
            createIssue(AUTHORING_ISSUE_CODES.INVALID_MASK, "footprint.mask", {
                field: "mask",
            })
        );
    }
    if (!isFootprintSolidMaskFitting({ w, h, mask, solidMask })) {
        issues.push(
            createIssue(
                AUTHORING_ISSUE_CODES.INVALID_MASK,
                "footprint.solidMask",
                { field: "solidMask" }
            )
        );
    }
    if (issues.length > 0) return { ok: false, issues };

    return { ok: true, mask, solidMask };
};
