import { avatarCategoriesTable, eq } from "@standin/database";
import type { AvatarCategory, AvatarSlot } from "@standin/contracts";
import { AVATAR_CATEGORIES_FOLDER } from "../consts/folders";
import type { AvatarUpload } from "../types";
import { storeAvatarPreview } from "../utils/storeAvatarPreview";
import { findCategoryRow } from "./utils/findCategoryRow";
import { toAvatarCategory } from "./utils/toAvatarCategory";

/** Puts the image shown beside the name of a category, or swaps the one it has. */
export const replaceCategoryPreview = async (
    slot: AvatarSlot,
    image: AvatarUpload | undefined
): Promise<AvatarCategory> => {
    const row = await findCategoryRow(slot);
    await storeAvatarPreview(
        image,
        row.previewFileId,
        AVATAR_CATEGORIES_FOLDER,
        async (tx, fileId) => {
            await tx
                .update(avatarCategoriesTable)
                .set({ previewFileId: fileId, updatedAt: new Date() })
                .where(eq(avatarCategoriesTable.slot, slot));
        }
    );
    return toAvatarCategory(await findCategoryRow(slot));
};
