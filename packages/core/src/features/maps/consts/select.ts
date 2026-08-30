import { mapsTable } from "@standin/database";

export const mapSelect = {
    id: mapsTable.id,
    name: mapsTable.name,
    width: mapsTable.width,
    height: mapsTable.height,
    tileSize: mapsTable.tileSize,
    mapJsonFileId: mapsTable.mapJsonFileId,
    thumbnailFileId: mapsTable.thumbnailFileId,
    organizationId: mapsTable.organizationId,
};
