import {
    db,
    mapsTable,
    mapTilesetsTable,
    filesTable,
    eq,
    and,
    isNull,
} from "@standin/database";
import { StorageProvider } from "@standin/infra";
import { MapNotFoundError } from "@standin/contracts";
import type { MapWithUrls } from "@standin/contracts";

export const findResolvedMapById = async (id: string): Promise<MapWithUrls> => {
    
    const [map] = await db
        .select({
            id: mapsTable.id,
            width: mapsTable.width,
            height: mapsTable.height,
            tileSize: mapsTable.tileSize,
            mapJsonFileName: filesTable.fileName,
        })
        .from(mapsTable)
        .innerJoin(filesTable, eq(filesTable.id, mapsTable.mapJsonFileId))
        .where(and(eq(mapsTable.id, id), isNull(mapsTable.deletedAt)));

    if (!map) throw new MapNotFoundError();

    const tilesets = await db
        .select({
            tilesetName: mapTilesetsTable.tilesetName,
            fileName: filesTable.fileName,
        })
        .from(mapTilesetsTable)
        .innerJoin(filesTable, eq(filesTable.id, mapTilesetsTable.fileId))
        .where(eq(mapTilesetsTable.mapId, id));

    const [mapJsonUrl, resolvedTilesets] = await Promise.all([
        StorageProvider.getUrl(map.mapJsonFileName),
        Promise.all(
            tilesets.map(async (tileset) => ({
                tilesetName: tileset.tilesetName,
                url: await StorageProvider.getUrl(tileset.fileName),
            }))
        ),
    ]);

    return {
        id: map.id,
        width: map.width,
        height: map.height,
        tileSize: map.tileSize,
        mapJsonUrl,
        tilesets: resolvedTilesets,
    };
};
