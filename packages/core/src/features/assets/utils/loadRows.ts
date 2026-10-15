import {
    db,
    assetPartsTable,
    assetsTable,
    filesTable,
    tilesetsTable,
    and,
    eq,
    inArray,
    isNull,
    sql,
} from "@standin/database";
import type { SQL } from "@standin/database";
import { AssetNotFoundError, TilesetNotFoundError } from "@standin/contracts";
import type { LibraryAsset, LibraryAssetPart } from "@standin/contracts";
import type { DbExecutor } from "../../../lib/types";
import { assetRowSelect, tilesetSelect } from "../consts/select";
import type { AssetRow, TilesetRow } from "../types";
import { liveAssetInScope, liveTilesetInScope } from "./scope";
import { toAssetDefinition } from "./toDefinitions";
import { findAssetIdsInUse } from "./usage";

/** Asset rows with the storage key of their file. Ordered by id. */
export const loadAssetRows = async (
    where: SQL | undefined,
    executor: DbExecutor = db
): Promise<AssetRow[]> =>
    executor
        .select(assetRowSelect)
        .from(assetsTable)
        .innerJoin(filesTable, eq(filesTable.id, assetsTable.fileId))
        .where(where)
        .orderBy(assetsTable.id);

/** A live asset of the scope. Another scope's asset is reported as missing. */
export const findScopedAsset = async (
    id: string,
    organizationId: string | null,
    executor: DbExecutor = db
): Promise<AssetRow> => {
    const [row] = await loadAssetRows(
        and(eq(assetsTable.id, id), liveAssetInScope(organizationId)),
        executor
    );
    if (!row) throw new AssetNotFoundError();
    return row;
};

/** Live rows of one family: the base and its variations. */
export const loadFamilyRows = (
    familyId: string,
    executor: DbExecutor = db
): Promise<AssetRow[]> =>
    loadAssetRows(
        and(
            sql`coalesce(${assetsTable.baseAssetId}, ${assetsTable.id}) = ${familyId}`,
            isNull(assetsTable.deletedAt)
        ),
        executor
    );

export const findScopedTileset = async (
    id: string,
    organizationId: string | null,
    executor: DbExecutor = db
): Promise<TilesetRow> => {
    const [row] = await executor
        .select(tilesetSelect)
        .from(tilesetsTable)
        .innerJoin(filesTable, eq(filesTable.id, tilesetsTable.fileId))
        .where(
            and(eq(tilesetsTable.id, id), liveTilesetInScope(organizationId))
        );
    if (!row) throw new TilesetNotFoundError();
    return row;
};

const loadPartsByAsset = async (
    assetIds: string[],
    executor: DbExecutor
): Promise<Map<string, LibraryAssetPart[]>> => {
    const byAsset = new Map<string, LibraryAssetPart[]>();
    if (assetIds.length === 0) return byAsset;

    const rows = await executor
        .select({
            assetId: assetPartsTable.assetId,
            partAssetId: assetPartsTable.partAssetId,
            offsetX: assetPartsTable.offsetX,
            offsetY: assetPartsTable.offsetY,
        })
        .from(assetPartsTable)
        .where(
            and(
                inArray(assetPartsTable.assetId, assetIds),
                isNull(assetPartsTable.deletedAt)
            )
        )
        .orderBy(assetPartsTable.id);
    for (const { assetId, ...part } of rows) {
        byAsset.set(assetId, [...(byAsset.get(assetId) ?? []), part]);
    }
    return byAsset;
};

/**
 * Rows as the admin library serves them: the definition plus whether a map
 * uses the row itself, and the parts of a bundle.
 */
export const toLibraryAssets = async (
    rows: AssetRow[],
    executor: DbExecutor = db
): Promise<LibraryAsset[]> => {
    const ids = rows.map(({ id }) => id);
    const inUse = await findAssetIdsInUse(ids, executor);
    const parts = await loadPartsByAsset(ids, executor);

    return Promise.all(
        rows.map(async (row) => ({
            ...(await toAssetDefinition(row)),
            inUse: inUse.has(row.id),
            parts: parts.get(row.id) ?? [],
        }))
    );
};
