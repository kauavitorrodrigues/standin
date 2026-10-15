import {
    db,
    mapsTable,
    mapAssetsTable,
    assetsTable,
    and,
    eq,
    inArray,
    isNull,
} from "@standin/database";
import { MAX_OBJECTS_PER_MAP, MapNotFoundError } from "@standin/contracts";
import type { MapRenderPayload } from "@standin/contracts";
import { loadAssetRows } from "../assets/utils/loadRows";
import {
    toAssetDefinitions,
    toTilesets,
} from "../assets/utils/toDefinitions";
import { MapLockService } from "./lock";
import { mapRenderSelect, placedAssetSelect } from "./consts/select";
import type { MapAccess } from "./types/map-access";
import { completeLayout } from "./utils/completeLayout";
import { listMapDesks } from "./utils/listMapDesks";
import { loadTilesetRows } from "./utils/loadTilesetRows";
import { toTilesetRowMap } from "./utils/toTilesetRowMap";

/**
 * Everything the client needs to draw a map and to decide what to show:
 * the layout with completed tilesets, the tilesets and asset definitions it
 * uses, the placed objects, who owns which desk, and what the user can do.
 * `access` is only a hint for the UI, the server decides on every write.
 */
export const buildMapRenderPayload = async (
    access: MapAccess,
    userId: string
): Promise<MapRenderPayload> => {
    const [map] = await db
        .select(mapRenderSelect)
        .from(mapsTable)
        .where(
            and(eq(mapsTable.id, access.mapId), isNull(mapsTable.deletedAt))
        );

    if (!map) throw new MapNotFoundError();

    const placed = await db
        .select(placedAssetSelect)
        .from(mapAssetsTable)
        .where(
            and(
                eq(mapAssetsTable.mapId, access.mapId),
                isNull(mapAssetsTable.deletedAt)
            )
        );

    const assetIds = [...new Set(placed.map(({ assetId }) => assetId))];
    // Deleted assets are served too: the map keeps rendering what it uses.
    const assetRows =
        assetIds.length === 0
            ? []
            : await loadAssetRows(inArray(assetsTable.id, assetIds));

    const tilesetRows = await loadTilesetRows(
        map.layout.tilesets.map(({ name }) => name)
    );
    const { layout } = await completeLayout(
        map.layout,
        toTilesetRowMap(tilesetRows)
    );
    const desks = await listMapDesks(access);

    return {
        map: {
            id: map.id,
            width: map.width,
            height: map.height,
            tileSize: map.tileSize,
            layoutVersion: map.layoutVersion,
            layout,
        },
        tilesets: await toTilesets(tilesetRows),
        assets: await toAssetDefinitions(assetRows),
        placed,
        desks,
        access: {
            canEdit: access.canEdit,
            ownDeskMapAssetId:
                desks.find((desk) => desk.userId === userId)?.mapAssetId ??
                null,
        },
        // Active objects only, the same rows as `placed`.
        limits: {
            objectsUsed: placed.length,
            objectsMax: MAX_OBJECTS_PER_MAP,
        },
        lock: MapLockService.getState(access.mapId),
    };
};
