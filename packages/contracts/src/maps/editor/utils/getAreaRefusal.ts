import type { LayoutIssueCode } from "../../layout/issues";
import { LAYOUT_ISSUE_CODES as Code } from "../../layout/issues";
import type { EditorModel } from "../types/editor-model";
import type { StampRect } from "../types/stamp-rect";
import { overlapsAreaZone } from "./stamp/overlapsAreaZone";
import { overlapsObject } from "./stamp/overlapsObject";
import { overlapsSpawn } from "./stamp/overlapsSpawn";

type Options = {
    // The zone being moved or resized, so it does not block itself.
    zoneId: number;
    // Objects that go with the area, so they do not block it.
    ignoreIds?: ReadonlySet<string>;
    // What the area already holds: objects there do not block it.
    except?: StampRect;
};

/**
 * Why an area cannot take this rectangle, or null when it can: outside the
 * map, over the spawn, over another area or over an object that is not its
 * own.
 */
export const getAreaRefusal = (
    model: EditorModel,
    rect: StampRect,
    { zoneId, ignoreIds, except }: Options
): LayoutIssueCode | null => {
    const isOutside =
        rect.x < 0 ||
        rect.y < 0 ||
        rect.x + rect.w > model.width ||
        rect.y + rect.h > model.height;
    if (isOutside) return Code.STAMP_OUT_OF_BOUNDS;
    if (overlapsSpawn(model, rect)) return Code.STAMP_COVERS_SPAWN;
    if (overlapsAreaZone(model, rect, zoneId)) return Code.STAMP_OVERLAPS_AREA;
    if (overlapsObject(model, rect, ignoreIds, except)) {
        return Code.STAMP_AREA_NOT_EMPTY;
    }
    return null;
};
