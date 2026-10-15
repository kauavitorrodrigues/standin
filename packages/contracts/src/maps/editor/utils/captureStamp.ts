import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../layout/issues";
import {
    STAMP_MAX_HEIGHT,
    STAMP_MAX_OBJECTS,
    STAMP_MAX_WIDTH,
    STAMP_MIN_SIZE,
    STAMP_VERSION,
} from "../consts/limits";
import { STAMP_ZONE_KINDS } from "../consts/stamp-zone-kinds";
import type { CaptureStampOptions } from "../types/capture-stamp-options";
import type { CaptureStampResult } from "../types/capture-stamp-result";
import type { EditorModel } from "../types/editor-model";
import type { Stamp } from "../types/stamp";
import type { StampRect } from "../types/stamp-rect";
import { captureStampLayers } from "./stamp/captureStampLayers";
import { captureStampObjects } from "./stamp/captureStampObjects";
import { toLayoutLibrary } from "./toLayoutLibrary";
import { validateStamp } from "./validateStamp";

const issue = (code: Parameters<typeof createIssue>[0], message: string) =>
    createIssue(code, "stamp", message);

/** Size and position problems of the rectangle, before anything is read. */
const checkRect = (model: EditorModel, rect: StampRect): LayoutIssue[] => {
    if (rect.w < STAMP_MIN_SIZE || rect.h < STAMP_MIN_SIZE) {
        return [issue(Code.STAMP_TOO_SMALL, Messages.stampTooSmall)];
    }
    if (rect.w > STAMP_MAX_WIDTH || rect.h > STAMP_MAX_HEIGHT) {
        return [issue(Code.STAMP_TOO_LARGE, Messages.stampTooLarge)];
    }

    const isInside =
        rect.x >= 0 &&
        rect.y >= 0 &&
        rect.x + rect.w <= model.width &&
        rect.y + rect.h <= model.height;
    return isInside
        ? []
        : [issue(Code.STAMP_OUT_OF_BOUNDS, Messages.stampOutOfBounds)];
};

// An `area` zone stays as it always was, with no kind. Only a room says so.
const buildStampZone = (opts: CaptureStampOptions): Stamp["zone"] => {
    if (opts.zoneLabel === null) return null;

    const label = opts.zoneLabel.trim();
    return opts.zoneKind === STAMP_ZONE_KINDS.PRIVATE
        ? { label, kind: STAMP_ZONE_KINDS.PRIVATE }
        : { label };
};

/**
 * Reads a rectangle of the model into a stamp: the four layers as palette
 * indexes, every object fully inside it (offsets included) and, with a
 * `zoneLabel`, the zone (a room with `zoneKind` private). Claimed desks, spawns, other zones, property
 * overrides and the background are not captured. The result goes through
 * validateStamp before it is returned.
 */
export const captureStamp = (
    model: EditorModel,
    rect: StampRect,
    opts: CaptureStampOptions
): CaptureStampResult => {
    const rectIssues = checkRect(model, rect);
    if (rectIssues.length > 0) return { ok: false, errors: rectIssues };

    const layers = captureStampLayers(
        model,
        toLayoutLibrary(model.library, model.usedTilesets),
        rect,
        opts.groundLayer
    );
    const captured = captureStampObjects(model, rect);

    const errors = [...layers.issues, ...captured.issues];
    if (captured.objects.length > STAMP_MAX_OBJECTS) {
        errors.push(
            issue(Code.STAMP_TOO_MANY_OBJECTS, Messages.stampTooManyObjects)
        );
    }
    if (errors.length > 0) return { ok: false, errors };

    const stamp: Stamp = {
        version: STAMP_VERSION,
        width: rect.w,
        height: rect.h,
        palette: layers.palette,
        layers: layers.layers,
        objects: captured.objects,
        zone: buildStampZone(opts),
    };

    const invalid = validateStamp(stamp, model.library);
    return invalid.length > 0
        ? { ok: false, errors: invalid }
        : { ok: true, stamp };
};
