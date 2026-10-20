import { avatarPartsTable, db, and, eq, isNull } from "@standin/database";
import { findActivePartRow } from "../utils/findPartRow";

/**
 * Deletes a part (soft delete). It leaves the catalog and frees its key, but
 * stays valid for whoever already chose it, and its files are kept. Retiring a
 * base part deletes every color variation of it too.
 */
export const deletePart = async (partId: string): Promise<void> => {
    const row = await findActivePartRow(partId);
    const now = new Date();

    await db.transaction(async (tx) => {
        await tx
            .update(avatarPartsTable)
            .set({ deletedAt: now })
            .where(eq(avatarPartsTable.id, partId));
        if (row.basePartId !== null) return;
        await tx
            .update(avatarPartsTable)
            .set({ deletedAt: now })
            .where(
                and(
                    eq(avatarPartsTable.basePartId, partId),
                    isNull(avatarPartsTable.deletedAt)
                )
            );
    });
};
