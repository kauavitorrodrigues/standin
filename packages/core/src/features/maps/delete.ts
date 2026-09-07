import { mapSelect } from "./consts/select";
import {
    db,
    mapsTable,
    mapTilesetsTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import { MapNotFoundError } from "@standin/contracts";
import type { MapEntity } from "@standin/contracts";
import { SpaceService } from "../spaces";
import { FileService } from "../files";

export const deleteMap = async (
    organizationId: string,
    id: string
): Promise<MapEntity> => {
    return db.transaction(async (tx) => {
        const [map] = await tx
            .update(mapsTable)
            .set({ deletedAt: new Date() })
            .where(
                and(
                    eq(mapsTable.id, id),
                    eq(mapsTable.organizationId, organizationId),
                    isNull(mapsTable.deletedAt)
                )
            )
            .returning(mapSelect);

        if (!map) throw new MapNotFoundError();

        await SpaceService.deleteByMapId(id, tx);

        const tilesets = await tx
            .select({ fileId: mapTilesetsTable.fileId })
            .from(mapTilesetsTable)
            .where(eq(mapTilesetsTable.mapId, id));

        const fileIds = [
            map.mapJsonFileId,
            map.thumbnailFileId,
            ...tilesets.map(({ fileId }) => fileId),
        ].filter((fileId): fileId is string => Boolean(fileId));

        await FileService.deleteManyByIds(fileIds, tx);

        return map;
    });
};
