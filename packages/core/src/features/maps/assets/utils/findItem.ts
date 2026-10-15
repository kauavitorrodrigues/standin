import {
    mapAssetsTable,
    assetsTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import { MapAssetNotFoundError } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import { mapAssetItemSelect } from "../consts/select";
import type { Item } from "../types/item";

export const findItem = async (
    tx: Transaction,
    mapId: string,
    rowId: string
): Promise<Item> => {
    const [item] = await tx
        .select(mapAssetItemSelect)
        .from(mapAssetsTable)
        .innerJoin(assetsTable, eq(assetsTable.id, mapAssetsTable.assetId))
        .where(
            and(
                eq(mapAssetsTable.id, rowId),
                eq(mapAssetsTable.mapId, mapId),
                isNull(mapAssetsTable.deletedAt)
            )
        );

    if (!item) throw new MapAssetNotFoundError();
    return item;
};
