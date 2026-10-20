import { avatarCategoriesTable, db, eq } from "@standin/database";
import type {
    AvatarCategory,
    AvatarSlot,
    UpdateAvatarCategoryData,
} from "@standin/contracts";
import { findCategoryRow } from "./utils/findCategoryRow";
import { toAvatarCategory } from "./utils/toAvatarCategory";

/** Changes the name or the position of a category. The slot never changes. */
export const updateCategory = async (
    slot: AvatarSlot,
    data: UpdateAvatarCategoryData
): Promise<AvatarCategory> => {
    await findCategoryRow(slot);
    await db
        .update(avatarCategoriesTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(avatarCategoriesTable.slot, slot));
    return toAvatarCategory(await findCategoryRow(slot));
};
