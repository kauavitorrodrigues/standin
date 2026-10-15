import { db, tilesetsTable, eq } from "@standin/database";
import { softDeleteFile } from "../library/utils/softDeleteFile";
import { findScopedTileset } from "../utils/loadRows";
import { findTilesetIdsInUse } from "../utils/usage";

/**
 * Removes a tileset. One that no map paints with is deleted for good, and its
 * PNG row is soft deleted (the object stays in storage). One a map already
 * paints with is only soft deleted: it leaves the palette but keeps its row
 * and file, so those maps render the same. Returns whether it was deleted for
 * good.
 */
export const deleteLibraryTileset = async (
    id: string,
    organizationId: string | null
): Promise<{ deleted: boolean }> => {
    const tileset = await findScopedTileset(id, organizationId);

    if ((await findTilesetIdsInUse([id])).has(id)) {
        await db
            .update(tilesetsTable)
            .set({ deletedAt: new Date() })
            .where(eq(tilesetsTable.id, id));
        return { deleted: false };
    }

    await db.transaction(async (tx) => {
        await tx.delete(tilesetsTable).where(eq(tilesetsTable.id, id));
        await softDeleteFile(tileset.fileId, tx);
    });
    return { deleted: true };
};
