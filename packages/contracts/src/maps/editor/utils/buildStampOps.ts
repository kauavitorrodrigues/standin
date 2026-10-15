import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import { LAYOUT_ISSUE_CODES as Code, createIssue } from "../../layout/issues";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { BuildStampOpsResult } from "../types/build-stamp-ops-result";
import type { EditorModel } from "../types/editor-model";
import type { Stamp } from "../types/stamp";
import { STAMP_ZONE_KINDS } from "../consts/stamp-zone-kinds";
import { getStampZoneKind } from "./getStampZoneKind";
import { nextStampRoomKey } from "./stamp/nextStampRoomKey";
import { replayOps } from "./replayOps";
import { isStampInsideMap } from "./stamp/isStampInsideMap";
import { buildStampClearOps } from "./stamp/buildStampClearOps";
import { buildStampObjectOps } from "./stamp/buildStampObjectOps";
import { buildStampPaintOps } from "./stamp/buildStampPaintOps";

/**
 * Operations that place a stamp with its top left corner at (tileX, tileY):
 * the clean up of the rectangle, the tiles, the objects and the zone (a room
 * with its own key when the stamp is private), in that order. They are applied on a working copy, so a failing one answers its
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
    groundLayer?: string,
    // The key of the room a private stamp creates. Called once per placement.
    // The default never repeats a key the map already has.
    newZoneKey: () => string = () => nextStampRoomKey(model)
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
        const rect = { x: tileX, y: tileY, w: stamp.width, h: stamp.height };
        const label = stamp.zone.label;
        ops.push({
            type: "set_zone",
            zone:
                getStampZoneKind(stamp) === STAMP_ZONE_KINDS.PRIVATE
                    ? { kind: "private", rect, label, key: newZoneKey() }
                    : { kind: "area", rect, label },
        });
    }

    const replay = replayOps(model, ops);
    if (!replay.ok) return { ok: false, errors: replay.errors };

    return { ok: true, ops, model: replay.model };
};
