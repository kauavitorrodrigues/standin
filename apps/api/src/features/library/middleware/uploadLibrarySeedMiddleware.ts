import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
    LibrarySeedFieldsInvalidError,
    LibrarySeedFileTooLargeError,
    LibrarySeedLibraryTooLargeError,
    LibrarySeedTooLargeError,
    LibrarySeedTooManyFilesError,
    MAX_SEED_FILES,
    MAX_SEED_LIBRARY_BYTES,
    MAX_SEED_PART_NAME_LENGTH,
    MAX_SEED_TOTAL_BYTES,
    MAX_UPLOAD_BYTES,
} from "@standin/contracts";
import { sendError } from "@/utils/sendError";

// Any file name is accepted: the PNGs are named by the path written in
// library.json, and the images are validated from their bytes by the seed.
// `library.json` is the one text field, so it is never held as a file. UTF-8
// names are kept as they are, since the paths may have accents.
const upload = multer({
    storage: multer.memoryStorage(),
    defParamCharset: "utf8",
    limits: {
        fileSize: MAX_UPLOAD_BYTES,
        files: MAX_SEED_FILES,
        fields: 1,
        fieldSize: MAX_SEED_LIBRARY_BYTES,
        fieldNameSize: MAX_SEED_PART_NAME_LENGTH,
    },
}).any();

// Refuses a request that announces more than the total before reading any of
// it. It sits after the auth guards, so only an admin gets this far.
export const limitLibrarySeedSize = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const length = Number(req.headers["content-length"]);
    if (Number.isFinite(length) && length > MAX_SEED_TOTAL_BYTES) {
        return sendError({ res, reportError: new LibrarySeedTooLargeError() });
    }
    next();
};

export const uploadLibrarySeed = upload;

const toSeedUploadError = (err: multer.MulterError) => {
    switch (err.code) {
        case "LIMIT_FILE_COUNT":
            return new LibrarySeedTooManyFilesError();
        case "LIMIT_FIELD_COUNT":
        case "LIMIT_FIELD_KEY":
        case "LIMIT_UNEXPECTED_FILE":
            return new LibrarySeedFieldsInvalidError();
        case "LIMIT_FIELD_VALUE":
            return new LibrarySeedLibraryTooLargeError();
        case "LIMIT_FILE_SIZE":
            return new LibrarySeedFileTooLargeError();
        default:
            return null;
    }
};

export const handleLibrarySeedUploadError = (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!(err instanceof multer.MulterError)) return next(err);
    const reportError = toSeedUploadError(err);
    if (!reportError) return next(err);
    return sendError({ res, reportError });
};
