import {
    db,
    assetsTable,
    assetPartsTable,
    mapAssetsTable,
    and,
    inArray,
    isNull,
    notInArray,
    or,
} from "@standin/database";
import { BaseHasVariantsError } from "@standin/contracts";
import { softDeleteFile } from "../library/utils/softDeleteFile";
import { findScopedAsset, loadFamilyRows } from "../utils/loadRows";
import { findAssetIdsInUse } from "../utils/usage";

/**
 * True when another live asset still lists one of the rows as a part of its
 * bundle, so removing the row would break that bundle.
 */
const isPartOfOtherAsset = async (ids: string[]): Promise<boolean> => {
    const [row] = await db
        .select({ id: assetPartsTable.id })
        .from(assetPartsTable)
        .where(
            and(
                inArray(assetPartsTable.partAssetId, ids),
                notInArray(assetPartsTable.assetId, ids),
                isNull(assetPartsTable.deletedAt)
            )
        )
        .limit(1);
    return row !== undefined;
};

/**
 * Deletes rows that no map uses for good: the placements already deleted, the
 * bundle links and the rows themselves. The PNG row is soft deleted and the
 * object stays in storage.
 */
const deleteUnusedAssets = async (
    rows: { id: string; fileId: string }[]
): Promise<void> => {
    const ids = rows.map(({ id }) => id);
    await db.transaction(async (tx) => {
        await tx
            .delete(mapAssetsTable)
            .where(inArray(mapAssetsTable.assetId, ids));
        await tx
            .delete(assetPartsTable)
            .where(
                or(
                    inArray(assetPartsTable.assetId, ids),
                    inArray(assetPartsTable.partAssetId, ids)
                )
            );
        await tx.delete(assetsTable).where(inArray(assetsTable.id, ids));
        for (const { fileId } of rows) await softDeleteFile(fileId, tx);
    });
};

/**
 * Deletes a variation directly. A base with variations needs `family`, which
 * deletes the whole family together. Rows that no map uses are deleted for
 * good. When a map uses any of them, or a bundle needs them as a part, they
 * are only soft deleted: maps that already use such a row keep rendering it,
 * only the palette stops offering it.
 */
export const deleteLibraryAsset = async (
    assetId: string,
    organizationId: string | null,
    { family = false }: { family?: boolean } = {}
): Promise<{ ids: string[]; deleted: boolean }> => {
    const asset = await findScopedAsset(assetId, organizationId);
    const members = await loadFamilyRows(asset.baseAssetId ?? asset.id);

    const isBase = asset.baseAssetId === null;
    if (isBase && members.length > 1 && !family) {
        throw new BaseHasVariantsError();
    }

    const rows = family ? members : [asset];
    const ids = rows.map(({ id }) => id);

    const inUse = (await findAssetIdsInUse(ids)).size > 0;
    if (!inUse && !(await isPartOfOtherAsset(ids))) {
        await deleteUnusedAssets(rows);
        return { ids, deleted: true };
    }

    await db
        .update(assetsTable)
        .set({ deletedAt: new Date() })
        .where(inArray(assetsTable.id, ids));
    return { ids, deleted: false };
};
