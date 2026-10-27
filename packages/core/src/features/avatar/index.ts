import { createBase } from "./bases/createBase";
import { listBases } from "./bases/listBases";
import { removeBasePreview } from "./bases/removeBasePreview";
import { replaceBasePreview } from "./bases/replaceBasePreview";
import { replaceBaseSheet } from "./bases/replaceBaseSheet";
import { deleteBase } from "./bases/deleteBase";
import { updateBase } from "./bases/updateBase";
import { getAvatarEditor } from "./catalog/getAvatarEditor";
import { listCategoryParts } from "./catalog/listCategoryParts";
import { listCategories } from "./categories/listCategories";
import { removeCategoryPreview } from "./categories/removeCategoryPreview";
import { replaceCategoryPreview } from "./categories/replaceCategoryPreview";
import { updateCategory } from "./categories/updateCategory";
import { createPart } from "./parts/createPart";
import { createVariation } from "./parts/createVariation";
import { listParts } from "./parts/listParts";
import { replaceFront } from "./parts/replaceFront";
import { deletePart } from "./parts/deletePart";
import { updatePart } from "./parts/updatePart";
import { replacePartPreview } from "./previews/replacePartPreview";
import { ensureSheetUpToDate } from "./sheets/ensureSheetUpToDate";
import { regenerateForBase } from "./sheets/regenerateForBase";
import { regenerateForPart } from "./sheets/regenerateForPart";
import { consumeStaleSheet } from "./sheets/staleSheets";
import { resolveUserSheetFileId } from "./sheets/resolveSheetFileId";
import { assignRandomAvatar } from "./user/assignRandomAvatar";
import { clearUserAvatar } from "./user/clearUserAvatar";
import { getUserAvatar } from "./user/getUserAvatar";
import { setUserAvatar } from "./user/setUserAvatar";
import { onAvatarSheetChanged } from "./utils/sheetEvents";

export const AvatarService = {
    createPart,
    createVariation,
    listParts,
    updatePart,
    replaceFront,
    deletePart,
    replacePartPreview,
    listCategories,
    updateCategory,
    replaceCategoryPreview,
    removeCategoryPreview,
    listBases,
    createBase,
    updateBase,
    replaceBaseSheet,
    replaceBasePreview,
    removeBasePreview,
    deleteBase,
    getEditor: getAvatarEditor,
    listCategoryParts,
    getUserAvatar,
    setUserAvatar,
    clearUserAvatar,
    assignRandom: assignRandomAvatar,
    ensureSheetUpToDate,
    // Reads the file a person is drawn with and never assembles anything.
    resolveSheetFileId: resolveUserSheetFileId,
    // True once for a person whose sheet failed to be assembled again.
    consumeStaleSheet,
    regenerateForPart,
    regenerateForBase,
    // Hook for the socket: runs when the sheet of a person is replaced or
    // cleared, before the old file is deleted.
    onSheetChanged: onAvatarSheetChanged,
};

export type {
    AvatarSheetBase,
    AvatarSheetChange,
    AvatarSheetListener,
    AvatarSheetWarning,
    AvatarUpload,
    UserAvatar,
} from "./types";
