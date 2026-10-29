import { db, assetsTable, and, inArray } from "@standin/database";
import { liveAssetInScope } from "../../utils/scope";
import type { SeedKeyIds } from "../types";

/** The ids of the live global assets, variations included, with these keys. */
export const findAssetIdsByKeys = async (
    keys: string[]
): Promise<SeedKeyIds> => {
    if (keys.length === 0) return new Map();
    const rows = await db
        .select({ id: assetsTable.id, key: assetsTable.key })
        .from(assetsTable)
        .where(and(liveAssetInScope(null), inArray(assetsTable.key, keys)));
    return new Map(rows.map(({ key, id }) => [key, id]));
};
