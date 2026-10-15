import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import { LAYOUT_ISSUE_CODES as Code, createIssue } from "../../layout/issues";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { BuildStampOpsResult } from "../types/build-stamp-ops-result";
import type { EditorModel } from "../types/editor-model";
import type { Stamp } from "../types/stamp";
import { replayOps } from "./replayOps";
import { isStampInsideMap } from "./stamp/isStampInsideMap";
import { buildStampClearOps } from "./stamp/buildStampClearOps";
import { buildStampObjectOps } from "./stamp/buildStampObjectOps";
import { buildStampPaintOps } from "./stamp/buildStampPaintOps";

/**
 * Operations that place a stamp with its top left corner at (tileX, tileY):
 * the clean up of the rectangle, the tiles, the objects and the area zone, in
 * that order. They are applied on a working copy, so a failing one answers its
 * errors and changes nothing. The stamp must have passed StampSchema.
 */
export const buildStampOps = (
    model: EditorModel,
    stamp: Stamp,
    tileX: number,
    tileY: number,
    newTempId: () => string,
    // The layer the ground of the stamp goes on. A map takes it on the floor
    // layer of its areas, the composer on its ground.
    groundLayer?: string
): BuildStampOpsResult => {
    if (!isStampInsideMap(model, stamp, tileX, tileY)) {
        return {
            ok: false,
            errors: [
                createIssue(
                    Code.STAMP_OUT_OF_BOUNDS,
                    "stamp",
                    Messages.stampOutOfBounds
                ),
            ],
        };
    }

    const ops: EditorOp[] = [
        ...buildStampClearOps(model, stamp, tileX, tileY, groundLayer),
        ...buildStampPaintOps(stamp, tileX, tileY, groundLayer),
        ...buildStampObjectOps(stamp, tileX, tileY, newTempId),
    ];

    if (stamp.zone) {
        ops.push({
            type: "set_zone",
            zone: {
                kind: "area",
                rect: { x: tileX, y: tileY, w: stamp.width, h: stamp.height },
                label: stamp.zone.label,
            },
        });
    }

    const replay = replayOps(model, ops);
    if (!replay.ok) return { ok: false, errors: replay.errors };

    return { ok: true, ops, model: replay.model };
};
