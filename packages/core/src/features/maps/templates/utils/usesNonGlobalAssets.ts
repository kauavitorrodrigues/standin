import {
    mapAssetsTable,
    assetsTable,
    tilesetsTable,
    and,
    eq,
    inArray,
    isNotNull,
    isNull,
} from "@standin/database";
import type { Transaction } from "@standin/database";

/**
 * Every tileset and every asset used by the map must be global
 * (`organization_id` null): a published template is visible to all
 * organizations.
 */
export const usesNonGlobalAssets = async (
    mapId: string,
    tilesetIds: string[],
    tx: Transaction
): Promise<boolean> => {
    const [privateAsset] = await tx
        .select({ id: assetsTable.id })
        .from(mapAssetsTable)
        .innerJoin(assetsTable, eq(assetsTable.id, mapAssetsTable.assetId))
        .where(
            and(
                eq(mapAssetsTable.mapId, mapId),
                isNull(mapAssetsTable.deletedAt),
                isNotNull(assetsTable.organizationId)
            )
        )
        .limit(1);
    if (privateAsset) return true;
    if (tilesetIds.length === 0) return false;

    const [privateTileset] = await tx
        .select({ id: tilesetsTable.id })
        .from(tilesetsTable)
        .where(
            and(
                inArray(tilesetsTable.id, tilesetIds),
                isNotNull(tilesetsTable.organizationId)
            )
        )
        .limit(1);
    return privateTileset !== undefined;
};
