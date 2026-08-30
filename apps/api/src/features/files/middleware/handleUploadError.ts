import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
    BaseError,
    FileTooLargeError,
    FileUploadError,
} from "@standin/contracts";
import { sendError } from "@/utils/sendError";

export const handleUploadError = (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return sendError({ res, reportError: new FileTooLargeError() });
    }

    if (err instanceof multer.MulterError) {
        return sendError({ res, reportError: new FileUploadError() });
    }

    if (err instanceof BaseError) {
        return sendError({ res, reportError: err });
    }

    next(err);
};
