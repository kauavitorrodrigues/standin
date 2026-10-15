import { getObjectsRevision } from "./getObjectsRevision";
import { loadEditorModel } from "./loadEditorModel";
import { persistModelDiff } from "./persistModelDiff";
import { publishMap } from "./publishMap";

export const MapPublishService = {
    getObjectsRevision,
    loadEditorModel,
    persistModelDiff,
    publish: publishMap,
};
