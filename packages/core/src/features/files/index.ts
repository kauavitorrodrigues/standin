import { uploadFile } from "./upload";
import { findFileById } from "./findById";
import { findFilesByIds } from "./findManyByIds";
import { deleteFile } from "./delete";

export const FileService = {
    upload: uploadFile,
    findById: findFileById,
    findManyByIds: findFilesByIds,
    delete: deleteFile,
};
