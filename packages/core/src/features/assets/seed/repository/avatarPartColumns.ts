import { avatarPartsTable } from "@standin/database";

// The columns the seed reads of a part or of a variation.
export const avatarPartColumns = {
    id: avatarPartsTable.id,
    key: avatarPartsTable.key,
    name: avatarPartsTable.name,
    slot: avatarPartsTable.slot,
    basePartId: avatarPartsTable.basePartId,
    colorKey: avatarPartsTable.colorKey,
    colorHex: avatarPartsTable.colorHex,
    fileId: avatarPartsTable.fileId,
    previewFileId: avatarPartsTable.previewFileId,
};
