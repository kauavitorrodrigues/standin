import { LAYOUT_ISSUE_CODES as Code } from "../../layout/issues";
import type { CanPlaceStampResult } from "../types/can-place-stamp-result";
import type { EditorModel } from "../types/editor-model";
import type { Stamp } from "../types/stamp";
import { findUnavailableStampItems } from "./stamp/findUnavailableStampItems";
import { isStampInsideMap } from "./stamp/isStampInsideMap";
import { overlapsAreaZone } from "./stamp/overlapsAreaZone";
import { overlapsObject } from "./stamp/overlapsObject";
import { overlapsSpawn } from "./stamp/overlapsSpawn";

/**
 * Cheap check for the placement ghost, without building any operation: the
 * rectangle fits in the map, no object is in the way, the spawn is not
 * covered, no other area is in the way, the objects fit under the limit and
 * the library lists every tileset and asset. Existing tiles do not block.
 */
export const canPlaceStamp = (
    model: EditorModel,
    stamp: Stamp,
    tileX: number,
    tileY: number
): CanPlaceStampResult => {
    const rect = { x: tileX, y: tileY, w: stamp.width, h: stamp.height };

    if (!isStampInsideMap(model, stamp, tileX, tileY)) {
        return { ok: false, reason: Code.STAMP_OUT_OF_BOUNDS };
    }

    if (overlapsObject(model, rect)) {
        return { ok: false, reason: Code.STAMP_AREA_NOT_EMPTY };
    }
    if (overlapsSpawn(model, rect)) {
        return { ok: false, reason: Code.STAMP_COVERS_SPAWN };
    }
    if (overlapsAreaZone(model, rect)) {
        return { ok: false, reason: Code.STAMP_OVERLAPS_AREA };
    }

    const used = model.limits.objectsUsed + stamp.objects.length;
    if (used > model.limits.objectsMax) {
        return { ok: false, reason: Code.TOO_MANY_OBJECTS };
    }

    const [unavailable] = findUnavailableStampItems(stamp, model.library);
    if (unavailable) return { ok: false, reason: unavailable.code };

    return { ok: true };
};
