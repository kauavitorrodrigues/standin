import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import type { CanPlaceAssetResult } from "../../types/can-place-asset-result";
import type { EditorModel } from "../../types/editor-model";

/** One more object must fit under the limit. The ignored object is being replaced, so it does not count. */
export const checkObjectLimit = (
    model: EditorModel,
    ignoreId?: string
): CanPlaceAssetResult => {
    const replaced = model.placed.some(({ id }) => id === ignoreId) ? 1 : 0;
    const used = model.limits.objectsUsed - replaced;

    if (used + 1 > model.limits.objectsMax) {
        return { ok: false, reason: Code.TOO_MANY_OBJECTS };
    }

    return { ok: true };
};
