import { db, tilesetsTable, and, inArray } from "@standin/database";
import { liveTilesetInScope } from "../../utils/scope";
import type { SeedKeyIds } from "../types";

/** The ids of the live global tilesets with these keys. */
export const findTilesetIdsByKeys = async (
    keys: string[]
): Promise<SeedKeyIds> => {
    if (keys.length === 0) return new Map();
    const rows = await db
        .select({ id: tilesetsTable.id, key: tilesetsTable.key })
        .from(tilesetsTable)
        .where(and(liveTilesetInScope(null), inArray(tilesetsTable.key, keys)));
    return new Map(rows.map(({ key, id }) => [key, id]));
};
