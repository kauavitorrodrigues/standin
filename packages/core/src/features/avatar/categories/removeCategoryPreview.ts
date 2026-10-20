import { avatarCategoriesTable, eq } from "@standin/database";
import type { AvatarCategory, AvatarSlot } from "@standin/contracts";
import { clearAvatarPreview } from "../utils/clearAvatarPreview";
import { findCategoryRow } from "./utils/findCategoryRow";
import { toAvatarCategory } from "./utils/toAvatarCategory";

/** Removes the image of a category. A category without one is returned as is. */
export const removeCategoryPreview = async (
    slot: AvatarSlot
): Promise<AvatarCategory> => {
    const row = await findCategoryRow(slot);
    await clearAvatarPreview(row.previewFileId, async (tx) => {
        await tx
            .update(avatarCategoriesTable)
            .set({ previewFileId: null, updatedAt: new Date() })
            .where(eq(avatarCategoriesTable.slot, slot));
    });
    return toAvatarCategory(await findCategoryRow(slot));
};
