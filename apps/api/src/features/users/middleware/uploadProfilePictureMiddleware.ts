import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import {
    PROFILE_PICTURE,
    PROFILE_PICTURE_UPLOAD_PARTS,
    ProfilePictureInvalidError,
    ProfilePictureTooLargeError,
    ProfilePictureUnsupportedMediaError,
} from "@standin/contracts";
import { sendError } from "@/utils/sendError";

const isAcceptedMimeType = (mimetype: string): boolean =>
    PROFILE_PICTURE.acceptedMimeTypes.some((accepted) => accepted === mimetype);

const isAcceptedExtension = (originalName: string): boolean => {
    const extension = path.extname(originalName).toLowerCase();
    return PROFILE_PICTURE.acceptedExtensions.some(
        (accepted) => accepted === extension
    );
};

// The mime type and the extension come from the client, so this is only a
// first filter: the format is read again from the bytes when the image is
// decoded. The upload has no text field, and a file under any other name is
// refused.
const createUpload = () =>
    multer({
        storage: multer.memoryStorage(),
        // Reject with an explicit error instead of `cb(null, false)`: dropping
        // the file silently leaves `req.file` undefined, which the controller
        // would read as "no file was sent" and answer 415 instead of 422.
        fileFilter: (_req, file, cb) => {
            const isValid =
                isAcceptedMimeType(file.mimetype) &&
                isAcceptedExtension(file.originalname);
            if (!isValid) return cb(new ProfilePictureInvalidError());

            cb(null, true);
        },
        limits: {
            fileSize: PROFILE_PICTURE.maxBytes,
            files: 1,
            fields: 0,
        },
    }).single(PROFILE_PICTURE_UPLOAD_PARTS.FILE);

export const uploadProfilePictureMiddleware = createUpload();

// 413 for what is too big, 415 for a part that is not accepted and 422 for a
// file the filter refused. Only the errors of this upload pipeline are
// answered here. Express also sends this handler the errors of the middlewares
// before it (the auth check, for one), and those go on with `next(err)`.
export const handleProfilePictureUploadError = (
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
                ? new ProfilePictureTooLargeError()
                : new ProfilePictureUnsupportedMediaError(),
        });
    }
    if (err instanceof ProfilePictureInvalidError) {
        return sendError({ res, reportError: err });
    }

    next(err);
};
