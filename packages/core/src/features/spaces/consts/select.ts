import { spacesTable, filesTable } from "@standin/database";

const spaceColumns = {
    id: spacesTable.id,
    name: spacesTable.name,
    organizationId: spacesTable.organizationId,
    mapId: spacesTable.mapId,
    guestAccess: spacesTable.guestAccess,
    createdAt: spacesTable.createdAt,
};

// What an update, a delete or a create gives back. A `returning` cannot join,
// so the thumbnail comes as the id of its file.
export const spaceSelect = {
    ...spaceColumns,
    thumbnailFileId: spacesTable.thumbnailFileId,
};

// What a read gives back, joined with the file of the thumbnail.
export const spaceReadSelect = {
    ...spaceColumns,
    thumbnailFileName: filesTable.fileName,
};

export const spaceRefSelect = {
    id: spacesTable.id,
    mapId: spacesTable.mapId,
    organizationId: spacesTable.organizationId,
};
