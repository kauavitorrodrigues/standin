import type { EditorModel } from "../types/editor-model";
import type { ModelDesk } from "../types/model-desk";

/**
 * The claim on a placed object, or undefined when the object is not a desk or
 * has no owner.
 */
export const getClaimedDesk = (
    model: Pick<EditorModel, "desks">,
    objectId: string
): ModelDesk | undefined =>
    model.desks.find(({ mapAssetId }) => mapAssetId === objectId);
