import {
    db,
    assetsTable,
    mapAssetsTable,
    mapsTable,
    and,
    eq,
    inArray,
    isNull,
    sql,
} from "@standin/database";
import type { DbExecutor } from "../../../lib/types";

/**
 * The assets that a live map has placed. A deleted asset still counts: its
 * maps keep rendering it.
 */
export const findAssetIdsInUse = async (
    assetIds: string[],
    executor: DbExecutor = db
): Promise<Set<string>> => {
    if (assetIds.length === 0) return new Set();

    const rows = await executor
        .selectDistinct({ id: mapAssetsTable.assetId })
        .from(mapAssetsTable)
        .innerJoin(mapsTable, eq(mapsTable.id, mapAssetsTable.mapId))
        .where(
            and(
                inArray(mapAssetsTable.assetId, assetIds),
                isNull(mapAssetsTable.deletedAt),
                isNull(mapsTable.deletedAt)
            )
        );

    return new Set(rows.map(({ id }) => id));
};

/**
 * The families (by base id) that have any row placed on a live map. A family
 * is in use when any of its variations is.
 */
export const findFamilyIdsInUse = async (
    familyIds: string[],
    executor: DbExecutor = db
): Promise<Set<string>> => {
    if (familyIds.length === 0) return new Set();

    const familyId = sql<string>`coalesce(${assetsTable.baseAssetId}, ${assetsTable.id})`;
    const rows = await executor
        .selectDistinct({ id: familyId })
        .from(mapAssetsTable)
        .innerJoin(assetsTable, eq(assetsTable.id, mapAssetsTable.assetId))
        .innerJoin(mapsTable, eq(mapsTable.id, mapAssetsTable.mapId))
        .where(
            and(
                inArray(familyId, familyIds),
                isNull(mapAssetsTable.deletedAt),
                isNull(mapsTable.deletedAt)
            )
        );

    return new Set(rows.map(({ id }) => id));
};
