import { db, mapsTable, and, eq, isNull } from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import { mapLayoutOnlySelect } from "./consts/select";
import { TILED_EXPORT_METADATA } from "./consts/export";
import { completeLayout } from "./utils/completeLayout";
import { loadTilesetRows } from "./utils/loadTilesetRows";
import { toTilesetRowMap } from "./utils/toTilesetRowMap";

/** Tiled JSON generated from the database on demand, nothing is stored. */
export const exportMapAsTiled = async (
    mapId: string
): Promise<Record<string, unknown>> => {
    const [map] = await db
        .select(mapLayoutOnlySelect)
        .from(mapsTable)
        .where(and(eq(mapsTable.id, mapId), isNull(mapsTable.deletedAt)));

    if (!map) throw new MapNotFoundError();

    const rows = await loadTilesetRows(
        map.layout.tilesets.map(({ name }) => name)
    );
    const { layout } = await completeLayout(map.layout, toTilesetRowMap(rows));

    return { ...layout, ...TILED_EXPORT_METADATA };
};
