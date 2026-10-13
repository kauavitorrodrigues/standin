import { MAX_LAYOUT_BYTES } from "../consts/constants";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "./consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "./issues";
import type { LayoutLibrary } from "./library";
import type { LayoutOp } from "./ops.schema";
import { applyErase } from "./ops/applyErase";
import { applyPaint } from "./ops/applyPaint";
import { applyRemoveZone } from "./ops/applyRemoveZone";
import { applySetZone } from "./ops/applySetZone";
import type { ApplyOpResult } from "./types/apply-op-result";
import type { MapLayout } from "../schemas/layout.schema";

const runOp = (
    layout: MapLayout,
    op: LayoutOp,
    library: LayoutLibrary
): LayoutIssue[] => {
    switch (op.type) {
        case "paint":
            return applyPaint(layout, op, library);
        case "erase":
            return applyErase(layout, op, library);
        case "set_zone":
            return applySetZone(layout, op);
        case "remove_zone":
            return applyRemoveZone(layout, op);
        case "set_background":
            layout.backgroundcolor = op.color;
            return [];
    }
};

/**
 * Applies one operation to a layout and returns the new layout. Pure: the
 * input is not mutated. When there are errors the returned layout is the
 * original one. Runs the same on the server and on the client.
 */
export const applyOp = (
    layout: MapLayout,
    op: LayoutOp,
    library: LayoutLibrary
): ApplyOpResult => {
    const next = structuredClone(layout);
    const errors = runOp(next, op, library);

    if (errors.length === 0 && JSON.stringify(next).length > MAX_LAYOUT_BYTES) {
        errors.push(
            createIssue(
                Code.LAYOUT_TOO_LARGE,
                "layout",
                Messages.layoutTooLarge
            )
        );
    }

    return { layout: errors.length > 0 ? layout : next, errors };
};
