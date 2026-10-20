import { avatarBasesTable } from "@standin/database";

// A base row as the services read it, with the ids of its two images.
export const avatarBaseSelect = {
    id: avatarBasesTable.id,
    key: avatarBasesTable.key,
    name: avatarBasesTable.name,
    kind: avatarBasesTable.kind,
    isDefault: avatarBasesTable.isDefault,
    fileId: avatarBasesTable.fileId,
    previewFileId: avatarBasesTable.previewFileId,
    createdAt: avatarBasesTable.createdAt,
    deletedAt: avatarBasesTable.deletedAt,
};
