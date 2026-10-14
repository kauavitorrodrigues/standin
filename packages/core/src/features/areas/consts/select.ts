import { areasTable, usersTable } from "@standin/database";

export const areaSelect = {
    id: areasTable.id,
    name: areasTable.name,
    width: areasTable.width,
    height: areasTable.height,
    objectCount: areasTable.objectCount,
    thumbnailFileId: areasTable.thumbnailFileId,
    createdBy: usersTable.name,
    updatedAt: areasTable.updatedAt,
    stamp: areasTable.stamp,
};
