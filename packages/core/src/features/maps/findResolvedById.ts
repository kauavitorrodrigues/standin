import { db, mapsTable, mapTilesetsTable, eq, and, isNull } from "@standin/database";
import { StorageProvider } from "@standin/infra";
import { MapNotFoundError } from "@standin/contracts";
import type { MapWithUrls } from "@standin/contracts";
import { FileService } from "../files";

export const findResolvedMapById = async (id: string): Promise<MapWithUrls> => {
    const [map] = await db
        .select({
            id: mapsTable.id,
            width: mapsTable.width,
            height: mapsTable.height,
            tileSize: mapsTable.tileSize,
            mapJsonFileId: mapsTable.mapJsonFileId,
        })
        .from(mapsTable)
        .where(and(eq(mapsTable.id, id), isNull(mapsTable.deletedAt)));

    if (!map) throw new MapNotFoundError();

    const tilesets = await db
        .select({
            tilesetName: mapTilesetsTable.tilesetName,
            fileId: mapTilesetsTable.fileId,
        })
        .from(mapTilesetsTable)
        .where(eq(mapTilesetsTable.mapId, id));

    const [mapJsonFile, tilesetFiles] = await Promise.all([
        FileService.findById(map.mapJsonFileId),
        FileService.findManyByIds(tilesets.map((tileset) => tileset.fileId)),
    ]);

    const tilesetFilesById = new Map(
        tilesetFiles.map((file) => [file.id, file])
    );

    const [mapJsonUrl, resolvedTilesets] = await Promise.all([
        StorageProvider.getUrl(mapJsonFile.fileName),
        Promise.all(
            tilesets
                .filter((tileset) => tilesetFilesById.has(tileset.fileId))
                .map(async (tileset) => ({
                    tilesetName: tileset.tilesetName,
                    url: await StorageProvider.getUrl(
                        tilesetFilesById.get(tileset.fileId)!.fileName
                    ),
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
