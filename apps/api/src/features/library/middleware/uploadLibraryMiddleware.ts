import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
    LIBRARY_UPLOAD_PARTS,
    LibraryUnsupportedMediaError,
    MAX_DATA_PART_BYTES,
    MAX_UPLOAD_BYTES,
    PngTooLargeError,
} from "@standin/contracts";
import { sendError } from "@/utils/sendError";

const MAX_PARTS = 2;

// The PNG is validated from its bytes by the service, so the mime type and the
// file name sent by the client are not checked here.
const createUpload = () =>
    multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: MAX_UPLOAD_BYTES,
            files: MAX_PARTS,
            fields: MAX_PARTS,
            fieldSize: MAX_DATA_PART_BYTES,
        },
    }).fields(
        Object.values(LIBRARY_UPLOAD_PARTS).map((name) => ({
            name,
            maxCount: 1,
        }))
    );

export const uploadLibraryParts = createUpload();

// 413 for what is too big, 415 for a part that is not accepted.
export const handleLibraryUploadError = (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        const tooBig =
            err.code === "LIMIT_FILE_SIZE" || err.code === "LIMIT_FIELD_VALUE";
        return sendError({
            res,
            reportError: tooBig
                ? new PngTooLargeError()
                : new LibraryUnsupportedMediaError(),
        });
    }
    next(err);
};
