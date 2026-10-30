import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
    SOUNDBOARD_MAX_CLIP_BYTES,
    SOUNDBOARD_NAME_MAX,
    SOUNDBOARD_UPLOAD_FIELDS,
    SoundboardFileTooLargeError,
    SoundboardNameInvalidError,
    SoundboardUnsupportedFormatError,
} from "@standin/contracts";
import { sendError } from "@/utils/sendError";

// The bytes are validated by the service, so the type and the file name the
// client sent are not checked here, only the size and the shape of the form.
const parseClipForm = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: SOUNDBOARD_MAX_CLIP_BYTES,
        files: 1,
        fields: 3,
        // Room for a multi-byte name, and no more.
        fieldSize: SOUNDBOARD_NAME_MAX * 4,
    },
}).single(SOUNDBOARD_UPLOAD_FIELDS.file);

// 413 for a file too big, 422 for a bad name field, 415 for any other form.
const refusalOf = (code: string) => {
    switch (code) {
        case "LIMIT_FILE_SIZE":
            return new SoundboardFileTooLargeError();
        case "LIMIT_FIELD_VALUE":
        case "LIMIT_FIELD_COUNT":
            return new SoundboardNameInvalidError();
        default:
            return new SoundboardUnsupportedFormatError();
    }
};

export const uploadClip = (req: Request, res: Response, next: NextFunction) =>
    parseClipForm(req, res, (err?: unknown) => {
        if (!err) return next();
        if (!(err instanceof multer.MulterError)) return next(err);
        return sendError({ res, reportError: refusalOf(err.code) });
    });
