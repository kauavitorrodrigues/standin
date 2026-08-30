import multer from "multer";
import { UnsupportedFileTypeError } from "@standin/contracts";

export const createUploadMiddleware = (opts: {
    allowedMimeTypes: readonly string[];
    maxSizeInBytes: number;
}) =>
    multer({
        storage: multer.memoryStorage(),
        fileFilter: (_req, file, cb) => {
            if (!opts.allowedMimeTypes.includes(file.mimetype)) {
                return cb(new UnsupportedFileTypeError());
            }
            cb(null, true);
        },
        limits: { fileSize: opts.maxSizeInBytes, files: 1 },
    });
