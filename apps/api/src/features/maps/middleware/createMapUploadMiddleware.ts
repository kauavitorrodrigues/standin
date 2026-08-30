import multer from "multer";
import {
    MAP_JSON_MIME_TYPES,
    TILESET_IMAGE_MIME_TYPES,
    MAX_UPLOAD_SIZE_IN_BYTES,
    UnsupportedFileTypeError,
} from "@standin/contracts";

const ALLOWED_MIME_TYPES_BY_FIELD: Record<string, readonly string[]> = {
    mapJsonFile: MAP_JSON_MIME_TYPES,
    tilesetImages: TILESET_IMAGE_MIME_TYPES,
};

export const uploadMapFiles = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ALLOWED_MIME_TYPES_BY_FIELD[file.fieldname];
        if (!allowedMimeTypes?.includes(file.mimetype)) {
            return cb(new UnsupportedFileTypeError());
        }
        cb(null, true);
    },
    limits: { fileSize: MAX_UPLOAD_SIZE_IN_BYTES },
}).fields([
    { name: "mapJsonFile", maxCount: 1 },
    { name: "tilesetImages", maxCount: 1000 },
]);
