import { filesTable } from "@standin/database";

export const fileSelect = {
    id: filesTable.id,
    originalName: filesTable.originalName,
    fileName: filesTable.fileName,
    extension: filesTable.extension,
    mimeType: filesTable.mimeType,
    sizeInBytes: filesTable.sizeInBytes,
};
