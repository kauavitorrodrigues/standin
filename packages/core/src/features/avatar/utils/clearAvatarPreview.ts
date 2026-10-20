import { db } from "@standin/database";
import type { Transaction } from "@standin/database";
import { softDeleteFile } from "../../assets/library/utils/softDeleteFile";

/**
 * Removes the preview of an owner row: `apply` sets the column to null and the
 * old `files` row gets a soft delete. Without a preview it does nothing.
 */
export const clearAvatarPreview = async (
    previousFileId: string | null,
    apply: (tx: Transaction) => Promise<void>
): Promise<void> => {
    if (previousFileId === null) return;
    await db.transaction(async (tx) => {
        await apply(tx);
        await softDeleteFile(previousFileId, tx);
    });
};
