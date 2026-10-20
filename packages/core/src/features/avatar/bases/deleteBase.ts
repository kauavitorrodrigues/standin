import { avatarBasesTable, db, eq } from "@standin/database";
import { AvatarBaseDefaultDeleteError } from "@standin/contracts";
import { findActiveBaseRow } from "./utils/findBaseRow";

/**
 * Deletes a base (soft delete). It leaves the lists and frees its key, but
 * stays valid for whoever already chose it, and its files are kept. The
 * default base cannot be deleted: make another one the default first.
 */
export const deleteBase = async (baseId: string): Promise<void> => {
    const row = await findActiveBaseRow(baseId);
    if (row.isDefault) throw new AvatarBaseDefaultDeleteError();

    await db
        .update(avatarBasesTable)
        .set({ deletedAt: new Date() })
        .where(eq(avatarBasesTable.id, baseId));
};
