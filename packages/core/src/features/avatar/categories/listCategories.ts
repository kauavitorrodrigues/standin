import { asc, avatarCategoriesTable, db } from "@standin/database";
import type { AvatarCategoryList } from "@standin/contracts";
import { toAvatarCategory } from "./utils/toAvatarCategory";

/** Every category in the order of the editor list. */
export const listCategories = async (): Promise<AvatarCategoryList> => {
    const rows = await db
        .select()
        .from(avatarCategoriesTable)
        .orderBy(
            asc(avatarCategoriesTable.sortOrder),
            asc(avatarCategoriesTable.slot)
        );
    return { categories: rows.map(toAvatarCategory) };
};
