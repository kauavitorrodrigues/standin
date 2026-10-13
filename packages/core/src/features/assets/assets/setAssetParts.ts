import {
    db,
    assetPartsTable,
    assetsTable,
    and,
    eq,
    inArray,
    isNull,
    or,
} from "@standin/database";
import {
    ASSET_PLACEMENTS,
    AssetInUseImmutableError,
    AssetPartIsBundleError,
    AssetPartNotGroundError,
    AssetPartOutOfScopeError,
    AssetPartSelfReferenceError,
} from "@standin/contracts";
import type { SetAssetPartsSchemaType } from "@standin/contracts";
import { findScopedAsset } from "../utils/loadRows";
import { findAssetIdsInUse } from "../utils/usage";

type Part = SetAssetPartsSchemaType["parts"][number];

// A part has to be placeable by whoever can place the root: global, or from
// the same organization as the root. It is placed on the ground, and a part
// is never a bundle itself.
const assertPartsUsable = async (
    rootId: string,
    organizationId: string | null,
    parts: Part[]
) => {
    const ids = [...new Set(parts.map(({ partAssetId }) => partAssetId))];
    if (ids.includes(rootId)) throw new AssetPartSelfReferenceError();
    if (ids.length === 0) return;

    const found = await db
        .select({ id: assetsTable.id, placement: assetsTable.placement })
        .from(assetsTable)
        .where(
            and(
                inArray(assetsTable.id, ids),
                isNull(assetsTable.deletedAt),
                organizationId === null
                    ? isNull(assetsTable.organizationId)
                    : or(
                          isNull(assetsTable.organizationId),
                          eq(assetsTable.organizationId, organizationId)
                      )
            )
        );
    if (found.length !== ids.length) throw new AssetPartOutOfScopeError();
    if (found.some(({ placement }) => placement !== ASSET_PLACEMENTS.GROUND)) {
        throw new AssetPartNotGroundError();
    }

    const nested = await db
        .select({ id: assetPartsTable.assetId })
        .from(assetPartsTable)
        .where(
            and(
                inArray(assetPartsTable.assetId, ids),
                isNull(assetPartsTable.deletedAt)
            )
        );
    if (nested.length > 0) throw new AssetPartIsBundleError();
};

/**
 * Replaces the parts of a bundle (placing the root also places them). It is
 * refused while a map uses the root, so no placed bundle changes under it.
 */
export const setLibraryAssetParts = async (
    assetId: string,
    organizationId: string | null,
    { parts }: SetAssetPartsSchemaType
) => {
    const root = await findScopedAsset(assetId, organizationId);

    if ((await findAssetIdsInUse([assetId])).has(assetId)) {
        throw new AssetInUseImmutableError(["parts"]);
    }
    await assertPartsUsable(assetId, root.organizationId, parts);

    return db.transaction(async (tx) => {
        await tx
            .update(assetPartsTable)
            .set({ deletedAt: new Date() })
            .where(
                and(
                    eq(assetPartsTable.assetId, assetId),
                    isNull(assetPartsTable.deletedAt)
                )
            );

        if (parts.length === 0) return [];

        return tx
            .insert(assetPartsTable)
            .values(parts.map((part) => ({ assetId, ...part })))
            .returning({
                id: assetPartsTable.id,
                partAssetId: assetPartsTable.partAssetId,
                offsetX: assetPartsTable.offsetX,
                offsetY: assetPartsTable.offsetY,
            });
    });
};
