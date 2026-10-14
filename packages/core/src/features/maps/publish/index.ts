import { loadEditorModel } from "./loadEditorModel";
import { persistModelDiff } from "./persistModelDiff";
import { publishMap } from "./publishMap";

export const MapPublishService = {
    loadEditorModel,
    persistModelDiff,
    publish: publishMap,
};
