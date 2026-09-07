import { filesTable, inArray, isNull, and } from "@standin/database";
import type { Transaction } from "@standin/database";
import { StorageProvider } from "@standin/infra";

export const deleteFilesByIds = async (
    ids: string[],
    tx: Transaction
): Promise<void> => {
    if (ids.length === 0) return;

    const files = await tx
        .select({ id: filesTable.id, fileName: filesTable.fileName })
        .from(filesTable)
        .where(and(inArray(filesTable.id, ids), isNull(filesTable.deletedAt)));

    if (files.length === 0) return;

    await Promise.all(
        files.map(({ fileName }) => StorageProvider.delete(fileName))
    );

    await tx
        .update(filesTable)
        .set({ deletedAt: new Date() })
        .where(inArray(filesTable.id, files.map(({ id }) => id)));
};
