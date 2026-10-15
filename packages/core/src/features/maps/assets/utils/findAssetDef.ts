import { assetsTable, and, eq, isNull, or } from "@standin/database";
import { MapAssetUnavailableError } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import { mapAssetDefSelect } from "../consts/select";
import type { AssetDef } from "../types/asset-def";

/** An asset the map owner may place: global, or from its own organization. */
export const findAssetDef = async (
    tx: Transaction,
    assetId: string,
    organizationId: string | null
): Promise<AssetDef> => {
    const [asset] = await tx
        .select(mapAssetDefSelect)
        .from(assetsTable)
        .where(
            and(
                eq(assetsTable.id, assetId),
                isNull(assetsTable.deletedAt),
                organizationId === null
                    ? isNull(assetsTable.organizationId)
                    : or(
                          isNull(assetsTable.organizationId),
                          eq(assetsTable.organizationId, organizationId)
                      )
            )
        );

    if (!asset) throw new MapAssetUnavailableError();
    return asset;
};
