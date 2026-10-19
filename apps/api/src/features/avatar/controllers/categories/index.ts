import { listAvatarCategories } from "./list";
import { updateAvatarCategory } from "./update";
import { replaceAvatarCategoryPreview } from "./replacePreview";
import { removeAvatarCategoryPreview } from "./removePreview";

export const AvatarCategoryController = {
    list: listAvatarCategories,
    update: updateAvatarCategory,
    replacePreview: replaceAvatarCategoryPreview,
    removePreview: removeAvatarCategoryPreview,
};
