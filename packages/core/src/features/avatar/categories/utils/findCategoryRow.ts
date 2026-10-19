import { avatarCategoriesTable, db, eq } from "@standin/database";
import { AvatarCategoryNotFoundError } from "@standin/contracts";
import type { AvatarSlot } from "@standin/contracts";
import type { DbExecutor } from "../../../../lib/types";

export type AvatarCategoryRow = typeof avatarCategoriesTable.$inferSelect;

/** The category of a slot, or `AvatarCategoryNotFoundError` (404). */
export const findCategoryRow = async (
    slot: AvatarSlot,
    executor: DbExecutor = db
): Promise<AvatarCategoryRow> => {
    const [row] = await executor
        .select()
        .from(avatarCategoriesTable)
        .where(eq(avatarCategoriesTable.slot, slot));
    if (!row) throw new AvatarCategoryNotFoundError();
    return row;
};
