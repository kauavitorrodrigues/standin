import { listAvatarCategoryParts } from "./categoryParts";
import { getAvatarEditor } from "./get";

export const AvatarEditorController = {
    get: getAvatarEditor,
    categoryParts: listAvatarCategoryParts,
};
