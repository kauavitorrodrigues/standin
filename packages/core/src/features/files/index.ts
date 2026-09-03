import { uploadFile } from "./upload";
import { findFileById } from "./findById";
import { deleteFile } from "./delete";

export const FileService = {
    upload: uploadFile,
    findById: findFileById,
    delete: deleteFile,
};
