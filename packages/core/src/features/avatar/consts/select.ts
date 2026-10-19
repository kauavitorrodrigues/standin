import { avatarPartsTable } from "@standin/database";

// A part row as the services read it, with the ids of its sheet and preview.
export const avatarPartSelect = {
    id: avatarPartsTable.id,
    key: avatarPartsTable.key,
    name: avatarPartsTable.name,
    slot: avatarPartsTable.slot,
    basePartId: avatarPartsTable.basePartId,
    colorKey: avatarPartsTable.colorKey,
    colorHex: avatarPartsTable.colorHex,
    fileId: avatarPartsTable.fileId,
    previewFileId: avatarPartsTable.previewFileId,
    createdAt: avatarPartsTable.createdAt,
    deletedAt: avatarPartsTable.deletedAt,
};
