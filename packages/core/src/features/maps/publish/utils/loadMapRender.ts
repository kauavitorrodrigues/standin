import {
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
import type { DbExecutor } from "../../../../lib/types";
import { loadAssetRows } from "../../../assets/utils/loadRows";
import {
    toAssetDefinitions,
    toTilesets,
} from "../../../assets/utils/toDefinitions";
import { mapRenderSelect, placedAssetSelect } from "../../consts/select";
import { MapLockService } from "../../lock";
import { getObjectsRevision } from "../getObjectsRevision";
import type { MapAccess } from "../../types/map-access";
import { completeLayout } from "../../utils/completeLayout";
import { listMapDesks } from "../../utils/listMapDesks";
import { loadTilesetRows } from "../../utils/loadTilesetRows";
import { toTilesetRowMap } from "../../utils/toTilesetRowMap";

/**
 * The render payload of a map read on the given executor, so a publish sees
 * the same rows it locked. It matches `buildMapRenderPayload` except for the
 * access hint, which the editor model never reads, so it is left empty
 * instead of queried. The desk owners are read, since the editor model checks
 * claimed desks with them.
 */
export const loadMapRender = async (
    executor: DbExecutor,
    access: MapAccess
): Promise<MapRenderPayload> => {
    const [map] = await executor
        .select(mapRenderSelect)
        .from(mapsTable)
        .where(
            and(eq(mapsTable.id, access.mapId), isNull(mapsTable.deletedAt))
        );

    if (!map) throw new MapNotFoundError();

    const placed = await executor
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
            : await loadAssetRows(inArray(assetsTable.id, assetIds), executor);

    const tilesetRows = await loadTilesetRows(
        map.layout.tilesets.map(({ name }) => name),
        executor
    );
    const { layout } = await completeLayout(
        map.layout,
        toTilesetRowMap(tilesetRows)
    );

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
        desks: await listMapDesks(access, executor),
        access: {
            canEdit: access.canEdit,
            canDecorate: access.canDecorate,
            ownDeskMapAssetId: null,
        },
        limits: {
            objectsUsed: placed.length,
            objectsMax: MAX_OBJECTS_PER_MAP,
        },
        lock: MapLockService.getState(access.mapId),
        objectsRevision: await getObjectsRevision(executor, access.mapId),
    };
};
