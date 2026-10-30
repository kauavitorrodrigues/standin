import { soundboardClipsTable, and, eq, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import { FileService } from "../files";

/**
 * Soft deletes the clips of an organization with their files, inside the
 * caller's transaction. Returns the storage keys for the caller to purge once
 * the transaction commits (see `FileService.purge`).
 */
export const deleteClipsByOrganizationId = async (
    organizationId: string,
    tx: Transaction
): Promise<string[]> => {
    const deleted = await tx
        .update(soundboardClipsTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(soundboardClipsTable.organizationId, organizationId),
                isNull(soundboardClipsTable.deletedAt)
            )
        )
        .returning({ fileId: soundboardClipsTable.fileId });

    return FileService.softDeleteManyByIds(
        deleted.map(({ fileId }) => fileId),
        tx
    );
};
