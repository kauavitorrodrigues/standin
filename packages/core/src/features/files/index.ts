import { uploadFile } from "./upload";
import { findFileById } from "./findById";
import { findFilesByIds } from "./findManyByIds";
import { deleteFile } from "./delete";
import { deleteFilesByIds } from "./deleteManyByIds";
import { softDeleteFilesByIds } from "./softDeleteManyByIds";
import { purgeStorageKeys } from "./purgeStorageKeys";
import { downloadFile } from "./download";

export const FileService = {
    upload: uploadFile,
    findById: findFileById,
    findManyByIds: findFilesByIds,
    delete: deleteFile,
    deleteManyByIds: deleteFilesByIds,
    softDeleteManyByIds: softDeleteFilesByIds,
    purge: purgeStorageKeys,
    download: downloadFile,
};
