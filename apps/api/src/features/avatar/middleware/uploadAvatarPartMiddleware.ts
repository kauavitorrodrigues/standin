import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
    AVATAR_PART_MAX_BYTES,
    AVATAR_UPLOAD_PARTS,
    AvatarSheetTooLargeError,
    LibraryUnsupportedMediaError,
    MAX_DATA_PART_BYTES,
} from "@standin/contracts";
import { sendError } from "@/utils/sendError";

// One slot for every form field: the sheets, the preview and the data.
const MAX_PARTS = Object.keys(AVATAR_UPLOAD_PARTS).length;

// The PNG is validated from its bytes by the service, so the mime type and the
// file name sent by the client are not checked here. The byte limit is the one
// of a sheet of an avatar part, smaller than the one of the rest of the
// library.
const createUpload = () =>
    multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: AVATAR_PART_MAX_BYTES,
            files: MAX_PARTS,
            fields: MAX_PARTS,
            fieldSize: MAX_DATA_PART_BYTES,
        },
    }).fields(
        Object.values(AVATAR_UPLOAD_PARTS).map((name) => ({
            name,
            maxCount: 1,
        }))
    );

export const uploadAvatarPartMiddleware = createUpload();

// 413 for what is too big, 415 for a part that is not accepted.
export const handleAvatarUploadError = (
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
                ? new AvatarSheetTooLargeError()
                : new LibraryUnsupportedMediaError(),
        });
    }
    next(err);
};
