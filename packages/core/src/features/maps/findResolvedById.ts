import { db, mapsTable, and, eq, isNull } from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import type { MapWithUrls } from "@standin/contracts";
import { mapResolvedSelect } from "./consts/select";
import { completeLayout } from "./utils/completeLayout";
import { loadTilesetRows } from "./utils/loadTilesetRows";
import { toTilesetRowMap } from "./utils/toTilesetRowMap";

/**
 * The layout of a map with its `tilesets` array completed, in the shape the
 * space details carry. The full render payload is `buildRenderPayload`.
 */
export const findResolvedMapById = async (id: string): Promise<MapWithUrls> => {
    const [map] = await db
        .select(mapResolvedSelect)
        .from(mapsTable)
        .where(and(eq(mapsTable.id, id), isNull(mapsTable.deletedAt)));

    if (!map) throw new MapNotFoundError();

    const rows = await loadTilesetRows(
        map.layout.tilesets.map(({ name }) => name)
    );
    const { layout, tilesets } = await completeLayout(
        map.layout,
        toTilesetRowMap(rows)
    );

    return {
        id: map.id,
        width: map.width,
        height: map.height,
        tileSize: map.tileSize,
        layout,
        tilesets,
    };
};
