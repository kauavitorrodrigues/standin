import type { Response } from "express";
import { BaseError } from "@standin/contracts";
import { sendError } from "@/utils/sendError";
import { ErrorMessages } from "@/enums/errorMessages";

export const sendUpdateUserError = (res: Response, error?: unknown) => {
    if (error instanceof BaseError) {
        return sendError({
            res,
            code: error.status,
            message: error.message,
            reportError: error,
        });
    }
    return sendError({
        res,
        message: ErrorMessages.UPDATE_USER,
        reportError: error,
    });
};

export const sendDeleteUserError = (res: Response, error?: unknown) => {
    return sendError({
        res,
        message: ErrorMessages.DELETE_USER,
        reportError: error,
    });
};
