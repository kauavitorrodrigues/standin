import {
    mapAssetsTable,
    assetsTable,
    and,
    eq,
    isNull,
} from "@standin/database";
import type { Transaction } from "@standin/database";
import { mapAssetItemSelect } from "../consts/select";
import type { Item } from "../types/item";

export const listItems = async (
    tx: Transaction,
    mapId: string
): Promise<Item[]> =>
    tx
        .select(mapAssetItemSelect)
        .from(mapAssetsTable)
        .innerJoin(assetsTable, eq(assetsTable.id, mapAssetsTable.assetId))
        .where(
            and(
                eq(mapAssetsTable.mapId, mapId),
                isNull(mapAssetsTable.deletedAt)
            )
        );
