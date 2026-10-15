import type { EditorModel } from "../../types/editor-model";
import type { Stamp } from "../../types/stamp";

/** True when the stamp, with its top left corner at (tileX, tileY), fits in the map. */
export const isStampInsideMap = (
    model: EditorModel,
    stamp: Stamp,
    tileX: number,
    tileY: number
): boolean =>
    Number.isInteger(tileX) &&
    Number.isInteger(tileY) &&
    tileX >= 0 &&
    tileY >= 0 &&
    tileX + stamp.width <= model.width &&
    tileY + stamp.height <= model.height;
