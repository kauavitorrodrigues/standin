import { mapSelect } from "./consts/select";
import { deriveTilesetName } from "./utils/deriveTilesetName";
import { db, mapsTable, mapTilesetsTable } from "@standin/database";
import { FileService } from "../files";
import type {
    MapDataSchemaType,
    MapEntity,
    UploadFileInput,
} from "@standin/contracts";

type CreateMapInput = {
    organizationId?: string;
    createdBy?: string;
    data: MapDataSchemaType;
    mapJsonFile: UploadFileInput;
    tilesetImages: UploadFileInput[];
};

export const createMap = async ({
    organizationId,
    createdBy,
    data,
    mapJsonFile,
    tilesetImages,
}: CreateMapInput): Promise<MapEntity> => {
    const mapJsonFileRecord = await FileService.upload(mapJsonFile);

    const [map] = await db
        .insert(mapsTable)
        .values({
            name: data.name,
            width: data.width,
            height: data.height,
            tileSize: data.tileSize,
            organizationId,
            createdBy,
            mapJsonFileId: mapJsonFileRecord.id,
        })
        .returning(mapSelect);

    if (tilesetImages.length > 0) {
        const tilesetFileRecords = await Promise.all(
            tilesetImages.map((image) => FileService.upload(image))
        );

        await db.insert(mapTilesetsTable).values(
            tilesetFileRecords.map((fileRecord, index) => ({
                mapId: map.id,
                fileId: fileRecord.id,
                tilesetName: deriveTilesetName(
                    tilesetImages[index].originalname
                ),
            }))
        );
    }

    return map;
};
