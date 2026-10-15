import type { MapLayout } from "../schemas/layout.schema";
import { applyOp } from "./applyOp";
import type { LayoutLibrary } from "./library";
import type { LayoutOp } from "./ops.schema";
import type { ApplyOpResult } from "./types/apply-op-result";

/** Applies a batch in order and stops at the first operation with errors. */
export const applyOps = (
    layout: MapLayout,
    ops: LayoutOp[],
    library: LayoutLibrary
): ApplyOpResult => {
    let current = layout;

    for (const [index, op] of ops.entries()) {
        const result = applyOp(current, op, library);
        if (result.errors.length > 0) {
            return {
                layout,
                errors: result.errors.map((issue) => ({
                    ...issue,
                    path: `ops.${index}.${issue.path}`,
                })),
            };
        }
        current = result.layout;
    }

    return { layout: current, errors: [] };
};
