import { uploadFile } from "./upload";
import { findFileById } from "./findById";
import { findFilesByIds } from "./findManyByIds";
import { deleteFile } from "./delete";
import { deleteFilesByIds } from "./deleteManyByIds";
import { downloadFile } from "./download";

export const FileService = {
    upload: uploadFile,
    findById: findFileById,
    findManyByIds: findFilesByIds,
    delete: deleteFile,
    deleteManyByIds: deleteFilesByIds,
    download: downloadFile,
};
