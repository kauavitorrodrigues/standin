import { db, assetPartsTable, and, eq, isNull } from "@standin/database";
import type { SeedBundlePartRow } from "../types";

/** The live parts of an asset, as stored. */
export const findBundleParts = (
    assetId: string
): Promise<SeedBundlePartRow[]> =>
    db
        .select({
            partAssetId: assetPartsTable.partAssetId,
            offsetX: assetPartsTable.offsetX,
            offsetY: assetPartsTable.offsetY,
        })
        .from(assetPartsTable)
        .where(
            and(
                eq(assetPartsTable.assetId, assetId),
                isNull(assetPartsTable.deletedAt)
            )
        );
