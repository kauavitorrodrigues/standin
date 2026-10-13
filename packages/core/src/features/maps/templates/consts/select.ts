import {
    mapTemplatesTable,
    mapsTable,
    filesTable,
} from "@standin/database";

export const templateSelect = {
    id: mapTemplatesTable.id,
    name: mapTemplatesTable.name,
    description: mapTemplatesTable.description,
    status: mapTemplatesTable.status,
    organizationId: mapTemplatesTable.organizationId,
    mapId: mapTemplatesTable.mapId,
    sizeTier: mapsTable.sizeTier,
    width: mapsTable.width,
    height: mapsTable.height,
    thumbnailFileName: filesTable.fileName,
    createdAt: mapTemplatesTable.createdAt,
};

export const templateIdSelect = { id: mapTemplatesTable.id };

export const templateStatusSelect = { status: mapTemplatesTable.status };

export const templateAvailableSelect = {
    id: mapTemplatesTable.id,
    mapId: mapTemplatesTable.mapId,
};

export const templateThumbnailSelect = {
    thumbnailFileId: mapTemplatesTable.thumbnailFileId,
    width: mapsTable.width,
    height: mapsTable.height,
};

export const templatePublishSelect = {
    status: mapTemplatesTable.status,
    mapId: mapTemplatesTable.mapId,
    thumbnailFileId: mapTemplatesTable.thumbnailFileId,
    layout: mapsTable.layout,
    sizeTier: mapsTable.sizeTier,
};

export const templateDeletedSelect = {
    mapId: mapTemplatesTable.mapId,
    thumbnailFileId: mapTemplatesTable.thumbnailFileId,
};

