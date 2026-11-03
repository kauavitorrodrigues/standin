import {
    db,
    assetsTable,
    deskAssignmentsTable,
    mapAssetsTable,
    and,
    asc,
    eq,
    isNull,
} from "@standin/database";
import { ASSET_TYPES } from "@standin/contracts";
import type { FreeDesk } from "@standin/contracts";
import { SpaceService } from "../../spaces";

/** The desks of the map of the space that nobody holds, top to bottom. */
export const listFreeDesks = async (spaceId: string): Promise<FreeDesk[]> => {
    const space = await SpaceService.findRefById(spaceId);

    const rows = await db
        .select({
            mapAssetId: mapAssetsTable.id,
            name: assetsTable.name,
            tileX: mapAssetsTable.tileX,
            tileY: mapAssetsTable.tileY,
            heldBy: deskAssignmentsTable.userId,
        })
        .from(mapAssetsTable)
        .innerJoin(assetsTable, eq(assetsTable.id, mapAssetsTable.assetId))
        .leftJoin(
            deskAssignmentsTable,
            and(
                eq(deskAssignmentsTable.mapAssetId, mapAssetsTable.id),
                isNull(deskAssignmentsTable.deletedAt)
            )
        )
        .where(
            and(
                eq(mapAssetsTable.mapId, space.mapId),
                eq(assetsTable.type, ASSET_TYPES.DESK),
                isNull(mapAssetsTable.deletedAt)
            )
        )
        .orderBy(asc(mapAssetsTable.tileY), asc(mapAssetsTable.tileX));

    return rows
        .filter((row) => row.heldBy === null)
        .map(({ heldBy: _heldBy, ...desk }) => desk);
};
